const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION (FIXED) ---
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,       // <--- Keeps connection active
  keepAliveInitialDelay: 0,    // <--- Starts keepalive immediately
  // ⬇️ THIS IS THE FIX FOR "ECONNRESET" ⬇️
  ssl: {
    rejectUnauthorized: false
  }
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database Connection Failed:', err.message);
    console.error('⚠️ If you are on University Wi-Fi, try using a Mobile Hotspot!');
  } else {
    console.log('✅ Connected to Cloud Database!');
    connection.release();
  }
});

// --- API ROUTES ---

// 1. GET TASKS
app.get('/tasks', (req, res) => {
  const sql = "SELECT * FROM tasks ORDER BY created_at DESC";
  pool.query(sql, (err, data) => {
    if (err) {
      console.error("❌ READ ERROR:", err.message);
      return res.status(500).json(err);
    }
    const formattedData = data.map(task => ({
      ...task,
      tags: task.tags ? task.tags.split(',') : [] 
    }));
    return res.json(formattedData);
  });
});

// 2. CREATE TASK
app.post('/tasks', (req, res) => {
  const sql = "INSERT INTO tasks (`title`, `description`, `status`, `priority`, `team`, `assignee`, `tags`, `due_date`) VALUES (?)";
  
  const tagsString = Array.isArray(req.body.tags) ? req.body.tags.join(',') : '';
  
  const values = [
    req.body.title,
    req.body.description || '',
    req.body.status || 'TODO',
    req.body.priority || 'MEDIUM',
    req.body.team || 'General',
    req.body.assignee || 'Unassigned',
    tagsString,
    req.body.due_date || ''
  ];

  console.log("📝 Attempting to save task:", values);

  pool.query(sql, [values], (err, data) => {
    if (err) {
      console.error("❌ SAVE ERROR:", err.message);
      return res.status(500).send("Database Error: " + err.message);
    }
    console.log("✅ Task Saved! ID:", data.insertId);
    return res.json({ message: "Task created", id: data.insertId });
  });
});

// 3. UPDATE TASK
app.put('/tasks/:id', (req, res) => {
  const sql = "UPDATE tasks SET `status` = ? WHERE id = ?";
  pool.query(sql, [req.body.status, req.params.id], (err, data) => {
    if (err) {
      console.error("❌ UPDATE ERROR:", err.message);
      return res.status(500).json(err);
    }
    return res.json("Status updated");
  });
});

// 4. DELETE TASK
app.delete('/tasks/:id', (req, res) => {
  const sql = "DELETE FROM tasks WHERE id = ?";
  pool.query(sql, [req.params.id], (err, data) => {
    if (err) {
      console.error("❌ DELETE ERROR:", err.message);
      return res.status(500).json(err);
    }
    return res.json("Task deleted");
  });
});

const PORT = 8081;
app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});