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
    const [rows] = await db.query(`
      SELECT 
        a.id,
        a.action,
        a.user_id,
        a.user_name,
        a.created_at,
        u.name as user_name_from_db,
        u.email as user_email
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC 
      LIMIT 5
    `);
    
    // Use user_name from activities table if available, otherwise use joined user name
    const formattedRows = rows.map(row => ({
      id: row.id,
      action: row.action,
      user_id: row.user_id,
      user_name: row.user_name || row.user_name_from_db || 'Unknown User',
      user_email: row.user_email || null,
      created_at: row.created_at
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.json([]); 
  }
};

// --- POST: Create Quick Task ---
const createQuickTask = async (req, res) => {
  try {
    const { title, priority, assignee, userId, userName } = req.body;
    await db.query(
      'INSERT INTO tasks (title, priority, status, assignee) VALUES (?, ?, "TODO", ?)',
      [title, priority, assignee || 'Unassigned']
    );
    await logActivity(`Quick task created: ${title}`, userId || null, userName || null);
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