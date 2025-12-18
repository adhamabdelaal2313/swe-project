const db = require("../config/db.config");
const logActivity = require('../utils/activityLogger');

// --- GET: Dashboard Stats ---
const getDashboardStats = async (req, res) => {
  try {
    // 1. Run SQL Queries
    const [total] = await db.query('SELECT COUNT(*) as count FROM tasks');
    const [todo] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE status = "TODO"');
    const [inProgress] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE status = "IN_PROGRESS"');
    const [done] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE status = "DONE"');
    
    // 2. Fetch Chart Data (Tasks Created in Last 7 days)
    const [chartData] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%a') as name,
        COUNT(*) as tasks,
        DATE(created_at) as fullDate
      FROM tasks 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY fullDate, name
      ORDER BY fullDate ASC
    `);

    // Ensure we have all 7 days even if some are 0
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayData = chartData.find(c => c.name === dayName);
      days.push({
        name: dayName,
        tasks: dayData ? dayData.tasks : 0
      });
    }

    // 3. Send Data
    res.json({
      totalTasks: total[0].count,
      todo: todo[0].count,
      inProgress: inProgress[0].count, 
      completed: done[0].count,
      chartData: days
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
    const { title, priority, description } = req.body;
    
    // Use req.user from auth middleware
    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : 'System';

    await db.query(
      'INSERT INTO tasks (title, description, priority, status, assignee_id) VALUES (?, ?, ?, "TODO", ?)',
      [title, description || '', priority || 'MEDIUM', userId]
    );
    
    await logActivity(`Quick task created: ${title}`, userId, userName);
    res.status(201).json({ message: "Task Saved" });
  } catch (error) {
    console.error("Quick Task Error:", error);
    res.status(500).json({ message: 'DB Error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  createQuickTask
};
