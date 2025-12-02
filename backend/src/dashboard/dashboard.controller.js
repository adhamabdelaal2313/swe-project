const db = require("../config/db.config");
const { logActivity } = require('../utils/activityLogger');

// --- GET: Dashboard Stats (Restored) ---
const getDashboardStats = async (req, res) => {
  try {
    // 1. Run SQL Queries
    const [total] = await db.query('SELECT COUNT(*) as count FROM tasks');
    const [todo] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE status = "TODO"');
    const [done] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE status = "DONE"');
    
    // 2. Send Data
    res.json({
      totalTasks: total[0].count,
      inProgress: todo[0].count, 
      completed: done[0].count,
      teamMembers: 4 // Placeholder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- GET: Recent Activity (Restored) ---
const getRecentActivity = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM activities ORDER BY created_at DESC LIMIT 5');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching activity:", error);
        res.json([]); 
    }
};

// --- POST: Create Quick Task (Minimal Logic) ---
const createQuickTask = async (req, res) => {
  try {
    const { title, priority, assignee } = req.body;
    await db.query(
      'INSERT INTO tasks (title, priority, status, assignee) VALUES (?, ?, "TODO", ?)',
      [title, priority, assignee || 'Unassigned']
    );
    // Log activity
    await db.query('INSERT INTO activities (action) VALUES (?)', [`created task: ${title}`]);
    res.status(201).json({ message: "Task Saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'DB Error' });
  }
};

module.exports = {
    getDashboardStats,
    getRecentActivity,
    createQuickTask,
    createTeam 
};