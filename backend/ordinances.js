const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { broadcastUpdate } = require('./websocket');
const { authenticateToken, authorizeRoles } = require('./auth');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

// CREATE NEW ORDINANCE & LINK BACKTRACKING HISTORY (Dynamic Category ID Version)
router.post('/', authenticateToken, authorizeRoles('Administrator', 'Editor'), async (req, res) => {
  const { 
    ordinance_number, 
    title, 
    date_enacted, 
    category_id, // Swapped from category enum text to category_id integer
    remarks, 
    nas_file_path,
    amends_ordinance_id, 
    new_status_for_old   
  } = req.body;

  const created_by = req.user.id; 
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Insert the new ordinance record using category_id
    const insertQuery = `
      INSERT INTO ordinances (ordinance_number, title, date_enacted, category_id, remarks, nas_file_path, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, ordinance_number, title;
    `;
    const newOrdinanceResult = await client.query(insertQuery, [
      ordinance_number, 
      title, 
      date_enacted, 
      parseInt(category_id), // Ensure it passes as an integer
      remarks, 
      nas_file_path, 
      created_by
    ]);
    
    const newOrdinance = newOrdinanceResult.rows[0];

    // 2. If this ordinance replaces or amends an older one, link them together
    if (amends_ordinance_id && new_status_for_old) {
      const updateOldQuery = `
        UPDATE ordinances 
        SET superseded_by_id = $1, status = $2::ordinance_status, updated_at = NOW()
        WHERE id = $3;
      `;
      await client.query(updateOldQuery, [newOrdinance.id, new_status_for_old, amends_ordinance_id]);
    }

    await client.query('COMMIT');
    
    // 🔥 TRIGGER REAL-TIME INTERNET NETWORK BROADCAST SIGNALS
    // Tells all active frontend dashboards to update their cards and tables immediately
    broadcastUpdate('ORDINANCE_REPOSITORY_CHANGED', {
      message: 'New legislation logged into repository.',
      number: ordinance_number
    });

    res.status(201).json({ 
      success: true, 
      message: 'Ordinance logged and backtracking linkages synced successfully.',
      ordinance: newOrdinance 
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);

    if (err.code === '23505') {
      return res.status(400).json({ 
        success: false, 
        message: `An ordinance with the number '${ordinance_number}' already exists.` 
      });
    }

    // Handle foreign key error if an invalid category_id is sent
    if (err.code === '23503') {
      return res.status(400).json({ 
        success: false, 
        message: 'The selected category or ordinance reference ID does not exist.' 
      });
    }

    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});


// GLOBAL PAGINATED SEARCH AND FILTER API
router.get('/', authenticateToken, async (req, res) => {
  // Extract pagination parameters (default to page 1, 10 items per page)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { q, category, status } = req.query;
  
  // Base queries
  let dataQuery = `SELECT id, ordinance_number, title, date_enacted, category_id, status, remarks, nas_file_path FROM ordinances WHERE 1=1`;
  let countQuery = `SELECT COUNT(*) FROM ordinances WHERE 1=1`;
  
  const queryParams = [];
  let paramCount = 1;

  // 1. Keyword filter
  if (q) {
    const filterStr = ` AND (ordinance_number ILIKE $${paramCount} OR title ILIKE $${paramCount})`;
    dataQuery += filterStr;
    countQuery += filterStr;
    queryParams.push(`%${q}%`);
    paramCount++;
  }

  // 2. Category filter (Modified to use category_id join matching)
  if (category) {
    const filterStr = ` AND category_id = $${paramCount}`;
    dataQuery += filterStr;
    countQuery += filterStr;
    queryParams.push(parseInt(category)); // Parse string query parameter to Integer
    paramCount++;
  }

  // 3. Status filter
  if (status) {
    const filterStr = ` AND status = $${paramCount}::ordinance_status`;
    dataQuery += filterStr;
    countQuery += filterStr;
    queryParams.push(status);
    paramCount++;
  }

  // Add sorting, limit, and offset to the data query
  dataQuery += ` ORDER BY date_enacted DESC, id DESC LIMIT $${paramCount} OFFSET $${paramCount + 1};`;

  try {
    // Execute the total count query first to know how many total pages exist
    const totalCountResult = await pool.query(countQuery, queryParams);
    const totalItems = parseInt(totalCountResult.rows[0].count);

    // Push limit and offset values to the parameters array for the data query
    const dataParams = [...queryParams, limit, offset];
    const dataResult = await pool.query(dataQuery, dataParams);

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      pagination: {
        total_items: totalItems,
        total_pages: totalPages,
        current_page: page,
        items_per_page: limit,
        has_next_page: page < totalPages,
        has_prev_page: page > 1
      },
      ordinances: dataResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});



// GET TIMELINE LINEAGE FOR A SPECIFIC ORDINANCE (Recursive Backtracking)
// Accessible by all authenticated roles (Admin, Editor, Viewer)
router.get('/:id/lineage', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  // The recursive query with all comments and white spaces removed to avoid windows compiler conflicts
  const query = `
    WITH RECURSIVE ordinance_lineage AS (
        SELECT id, ordinance_number, title, status, remarks, superseded_by_id, 1 AS generation_level
        FROM ordinances
        WHERE id = $1
        UNION ALL
        SELECT o.id, o.ordinance_number, o.title, o.status, o.remarks, o.superseded_by_id, ol.generation_level + 1
        FROM ordinances o
        JOIN ordinance_lineage ol ON o.id = ol.superseded_by_id
    )
    SELECT 
        ol.generation_level,
        ol.id AS current_version_id,
        ol.ordinance_number AS current_version_number,
        ol.title AS current_version_title,
        ol.status AS current_version_status,
        ol.remarks AS current_version_remarks,
        next_v.ordinance_number AS next_amending_number,
        next_v.title AS next_amending_title
    FROM ordinance_lineage ol
    LEFT JOIN ordinances next_v ON ol.superseded_by_id = next_v.id
    ORDER BY ol.generation_level ASC;
  `;

  try {
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ordinance lineage path not found.' });
    }

    res.json({ 
      success: true, 
      lineage: result.rows 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);

    // Gracefully handle PostgreSQL Unique Constraint Violation
    if (err.code === '23505') {
      return res.status(400).json({ 
        success: false, 
        message: `An ordinance with the number '${ordinance_number}' already exists in the system.` 
      });
    }

    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// UPGRADED PUT ROUTE WITH HISTORICAL RELATIONSHIP TRANSFERS
router.put('/:id', authenticateToken, authorizeRoles('Administrator', 'Editor'), async (req, res) => {
  const { id } = req.params;
  const { 
    ordinance_number, 
    title, 
    date_enacted, 
    category_id, 
    remarks, 
    nas_file_path,
    amends_ordinance_id, // The newly chosen old ordinance ID
    new_status_for_old   // The new status for that old ordinance (Amended/Repealed)
  } = req.body;

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Clear any old linkages where this ordinance was previously the successor
    // This resets the old ordinance back to 'Active' before we map the new link
    await client.query(`
      UPDATE ordinances 
      SET superseded_by_id = NULL, status = 'Active'::ordinance_status 
      WHERE superseded_by_id = $1
    `, [id]);

    // 2. Update the primary metadata columns for the current ordinance
    const updateQuery = `
      UPDATE ordinances 
      SET ordinance_number = $1, title = $2, date_enacted = $3, category_id = $4, 
          remarks = $5, nas_file_path = $6, updated_at = NOW()
      WHERE id = $7;
    `;
    await client.query(updateQuery, [
      ordinance_number, title, date_enacted, parseInt(category_id), remarks, nas_file_path, id
    ]);

    // 3. If the editor specified an amendment link, establish the new relationship node
    if (amends_ordinance_id) {
      const updateOldQuery = `
        UPDATE ordinances 
        SET superseded_by_id = $1, status = $2::ordinance_status, updated_at = NOW()
        WHERE id = $3;
      `;
      await client.query(updateOldQuery, [id, new_status_for_old || 'Amended', amends_ordinance_id]);
    }

    await client.query('COMMIT');

    // Trigger real-time WebSocket broadcast sync signal
    broadcastUpdate('ORDINANCE_REPOSITORY_CHANGED', { message: 'An ordinance link was corrected.', id });

    res.json({ success: true, message: 'Ordinance record and historical linkages updated successfully.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ success: false, message: `Ordinance number '${ordinance_number}' already exists.` });
    }
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});



module.exports = router;
