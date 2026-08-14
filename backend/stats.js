const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken } = require('./auth');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

// GET DASHBOARD METRICS SUMMARY COUNTS
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    // Run three counts simultaneously using Promise.all for optimized speed
    const [totalRes, amendedRes, repealedRes] = await Promise.all([
      pool.query('SELECT COUNT(*)::int FROM ordinances;'),
      pool.query("SELECT COUNT(*)::int FROM ordinances WHERE status = 'Amended';"),
      pool.query("SELECT COUNT(*)::int FROM ordinances WHERE status = 'Repealed';")
    ]);

    res.json({
      success: true,
      counts: {
        total: totalRes.rows[0].count,
        amended: amendedRes.rows[0].count,
        repealed: repealedRes.rows[0].count
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
