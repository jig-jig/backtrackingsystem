const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken, authorizeRoles } = require('./auth');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

// 1. GET ALL CATEGORIES (Publicly accessible to logged-in users for dropdowns)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM categories ORDER BY name ASC;');
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. ADD A NEW CUSTOM CATEGORY (Admin and Editor only)
router.post('/', authenticateToken, authorizeRoles('Administrator', 'Editor'), async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING id, name;',
      [name]
    );
    res.status(201).json({ success: true, message: 'Category added!', category: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation code
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. UPDATE A CATEGORY NAME (Admin and Editor only)
router.put('/:id', authenticateToken, authorizeRoles('Administrator', 'Editor'), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name;',
      [name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.json({ success: true, message: 'Category updated!', category: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
