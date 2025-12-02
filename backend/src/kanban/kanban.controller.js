const mysql = require('mysql2');
require('dotenv').config();

// Create Database Connection Pool
const db = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
}).promise();

// --- TASKS LOGIC ---

exports.getTasks = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tasks ORDER BY created_at DESC");
        const formatted = rows.map(t => ({ 
            ...t, 
            tags: t.tags ? t.tags.split(',') : [] 
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { title, description, status, priority, team, assignee, tags, due_date } = req.body;
        const tagsString = Array.isArray(tags) ? tags.join(',') : '';
        
        const sql = `INSERT INTO tasks (title, description, status, priority, team, assignee, tags, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(sql, [title, description, status, priority, team, assignee, tagsString, due_date]);
        
        res.json({ id: result.insertId, message: "Task Created" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        await db.query("UPDATE tasks SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: "Status Updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM tasks WHERE id = ?", [id]);
        res.json({ message: "Task Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- DROPDOWN HELPERS ---

exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, name FROM users ORDER BY name ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTeams = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT team_id, team_name FROM teams ORDER BY team_name ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};