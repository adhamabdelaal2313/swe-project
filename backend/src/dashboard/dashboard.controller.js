const db = require("../config/db.config");

// --- GET: Dashboard Stats (Restored) ---
const getDashboardStats = async (req, res) => {
    try {
        const [total] = await db.query('SELECT COUNT(*) as count FROM tasks');
        const [todo] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE status = "TODO"');
        const [done] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE status = "DONE"');
        
        res.json({
            totalTasks: total[0].count,
            inProgress: todo[0].count, 
            completed: done[0].count,
            teamMembers: 4 // Placeholder
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
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
        const { title } = req.body; // Only grab title
        
        // 💡 FIX: MINIMAL SQL - Insert ONLY title, relying on DB defaults for everything else
        await db.query(
            'INSERT INTO tasks (title) VALUES (?)',
            [title]
        );
        
        await db.query('INSERT INTO activities (action) VALUES (?)', [`created minimal task: ${title}`]);
        res.status(201).json({ message: "Task Saved MINIMAL" });
    } catch (error) {
        // 🚨 CRITICAL: Enhanced Logging to find the source of the 500
        console.error("Task Creation MySQL Error:", error); 
        res.status(500).json({ 
            message: 'DB Error while creating task',
            dbError: error.sqlMessage || error.message || 'Check server console for detailed SQL error.' 
        });
    }
};

// --- POST: Create New Team (Minimal Logic) ---
const createTeam = async (req, res) => {
    try {
        const { name } = req.body; // Only grab name
        
        // 💡 FIX: MINIMAL SQL - Insert ONLY name, relying on DB defaults
        await db.query(
            'INSERT INTO teams (name) VALUES (?)',
            [name]
        );
        
        await db.query('INSERT INTO activities (action) VALUES (?)', [`created minimal team: ${name}`]);
        res.status(201).json({ message: "Team Created MINIMAL" });
    } catch (error) {
        // 🚨 CRITICAL: Enhanced Logging to find the source of the 500
        console.error("Team Creation MySQL Error:", error); 
        res.status(500).json({ 
            message: 'DB Error while creating team',
            dbError: error.sqlMessage || error.message || 'Check server console for detailed SQL error.' 
        });
    }
};

module.exports = {
    getDashboardStats,
    getRecentActivity,
    createQuickTask,
    createTeam 
};