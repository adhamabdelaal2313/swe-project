const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION SETUP ---
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,       // Stability fix
  keepAliveInitialDelay: 0,    // Stability fix
  ssl: {
    rejectUnauthorized: false  // Fix for "ECONNRESET" on cloud
  }
});

// Test Connection on Start
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ DB Connection Failed:', err.message);
  } else {
    console.log('✅ Teams Backend Connected to Cloud DB!');
    connection.release();
  }
});

// --- API ROUTES (The Logic) ---

// 1. GET ALL TEAMS
app.get('/teams', (req, res) => {
  const sql = "SELECT * FROM teams ORDER BY created_at DESC";
  
  pool.query(sql, (err, data) => {
    if (err) {
      console.error("❌ READ ERROR:", err.message);
      // If table doesn't exist yet, return empty array instead of crashing
      return res.json([]); 
    }
    
    // The "members" list is stored as a text string in SQL.
    // We must convert it back to a real JavaScript Array/Object here.
    const formattedData = data.map(team => ({
      ...team,
      members: team.members ? JSON.parse(team.members) : []
    }));
    
    return res.json(formattedData);
  });
});

// 2. CREATE NEW TEAM
app.post('/teams', (req, res) => {
  const sql = "INSERT INTO teams (`title`, `description`, `color`, `members`) VALUES (?)";
  
  // We cannot store a JavaScript Array directly in SQL.
  // We convert it to a String (JSON) first.
  const membersString = JSON.stringify(req.body.members || []);
  
  const values = [
    req.body.title,
    req.body.description,
    req.body.color,
    membersString
  ];

  pool.query(sql, [values], (err, data) => {
    if (err) {
      console.error("❌ SAVE ERROR:", err.message);
      return res.status(500).json({ error: err.message });
    }
    return res.json({ message: "Team created", id: data.insertId });
  });
});

// 3. DELETE TEAM
app.delete('/teams/:id', (req, res) => {
  const sql = "DELETE FROM teams WHERE id = ?";
  pool.query(sql, [req.params.id], (err, data) => {
    if (err) {
      console.error("❌ DELETE ERROR:", err.message);
      return res.status(500).json(err);
    }
    return res.json("Team deleted");
  });
});

// --- START SERVER ---
// We use Port 8082 so it doesn't conflict with Kanban (8081)
const PORT = 8082;
app.listen(PORT, () => {
  console.log(`Teams Backend running on port ${PORT}`);
});
