const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const { router: authRouter, authenticateToken, authorizeRoles } = require('./auth');
const ordinanceRouter = require('./ordinances');
const categoryRouter = require('./categories');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/ordinances', ordinanceRouter);
app.use('/api/auth', authRouter);
app.use('/api/categories', categoryRouter);

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

// Test Database Connection Route
// app.get('/api/test-db', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT NOW()');
//     res.json({ 
//       success: true, 
//       message: "Database connected successfully!", 
//       timestamp: result.rows[0].now 
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

app.get('/api/admin-dashboard', authenticateToken, authorizeRoles('Administrator', 'Editor'), (req, res) => {
  res.json({ message: `Welcome ${req.user.username}! You have accessed management space.` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});