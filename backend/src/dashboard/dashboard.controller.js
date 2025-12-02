const db = require("../config/db.config");
const { logActivity } = require('../utils/activityLogger');

// --- GET: Dashboard Stats ---
const getDashboardStats = async (req, res) => {
  try {
    // 1. Run SQL Queries
    const [total] = await db.query('SELECT COUNT(*) as count FROM tasks');
    const [todo] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE status = "TODO"');
    const [inProgress] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE status = "IN_PROGRESS"');
    const [done] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE status = "DONE"');
    
    // 2. Send Data
    res.json({
      totalTasks: total[0].count,
      todo: todo[0].count,
      inProgress: inProgress[0].count, 
      completed: done[0].count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- GET: Recent Activity ---
const getRecentActivity = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM activities ORDER BY created_at DESC LIMIT 5');
    res.json(rows);
  } catch (error) {
    res.json([]); 
  }
};

// --- POST: Create Quick Task ---
const createQuickTask = async (req, res) => {
  try {
    const { title, priority, assignee } = req.body;
    await db.query(
      'INSERT INTO tasks (title, priority, status, assignee) VALUES (?, ?, "TODO", ?)',
      [title, priority, assignee || 'Unassigned']
    );
    await logActivity(`Quick task created: ${title}`);
    res.status(201).json({ message: "Task Saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'DB Error' });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  createQuickTask
};