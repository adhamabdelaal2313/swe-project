const db = require('../config/db.config');
const logActivity = require('../utils/activityLogger');

// GET: Fetch all tasks (Your advanced search logic!)
const getAllTasks = async (req, res) => {
    const { search } = req.query; // Capture the search query parameter
    let sql = `
    SELECT 
        id, 
        title, 
        description, 
        CASE WHEN status IS NULL THEN 'TODO' ELSE status END AS status, 
        CASE WHEN priority IS NULL THEN 'MEDIUM' ELSE priority END AS priority,
        CASE WHEN team IS NULL THEN 'General' ELSE team END AS team,
        assignee, 
        due_date, 
        created_at 
    FROM tasks
    `;
    let params = [];

    // Add WHERE clause for search functionality
    if (search) {
        sql += ` WHERE title LIKE ? OR description LIKE ? OR assignee LIKE ? OR team LIKE ?`;
        const searchTerm = `%${search}%`;
        params = [searchTerm, searchTerm, searchTerm, searchTerm]; 
    }

    sql += ` ORDER BY created_at DESC`; // Order by most recent first

    try {
        const [tasks] = await db.query(sql, params);

        if (tasks.length === 0 && search) {
            return res.status(200).json([]);
        }

        res.status(200).json(tasks);
    } catch (error) {
        console.error('DATABASE ERROR during task fetching:', error);
        res.status(500).json({ 
            message: 'Failed to fetch tasks due to a critical server error.',
            error: error.message 
        });
    }
};

// POST: Create a new task (Your full creation logic!)
const createTask = async (req, res) => {
    const { title, description, status, priority, team, assignee, tags, due_date, userId, userName } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Title is required for a new task.' });
    }

    const sql = `
        INSERT INTO tasks (title, description, status, priority, team, assignee, tags, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        title,
        description || null,
        status || 'TODO',
        priority || 'MEDIUM',
        team || 'General',
        assignee || 'Unassigned',
        tags || null,
        due_date || null
    ];

    try {
        const [result] = await db.query(sql, params);

        // Log the activity
        await logActivity(`Created task: ${title} (#${result.insertId})`, userId || null, userName || null);

        res.status(201).json({
            id: result.insertId, 
            message: 'Task created successfully! 🎉',
            taskId: result.insertId,
            title: title
        });
    } catch (error) {
        console.error('DATABASE ERROR during task creation:', error);
        res.status(500).json({ 
            message: 'Failed to create task due to a critical server error.',
            error: error.message 
        });
    }
};

// PUT: Update a task (Your advanced update logic!)
const updateTask = async (req, res) => {
    const taskId = req.params.id;
    const { title, description, is_completed, status, priority, team, assignee, tags, due_date, userId, userName } = req.body;

    try {
        const fields = [];
        const values = [];

        // Build the query dynamically for every possible field
        if (title !== undefined) { fields.push('title = ?'); values.push(title); }
        if (description !== undefined) { fields.push('description = ?'); values.push(description); }
        if (is_completed !== undefined) { fields.push('is_completed = ?'); values.push(is_completed); }
        if (status !== undefined) { fields.push('status = ?'); values.push(status); }
        if (priority !== undefined) { fields.push('priority = ?'); values.push(priority); }
        if (team !== undefined) { fields.push('team = ?'); values.push(team); }
        if (assignee !== undefined) { fields.push('assignee = ?'); values.push(assignee); }
        if (tags !== undefined) { fields.push('tags = ?'); values.push(tags); }
        if (due_date !== undefined) { fields.push('due_date = ?'); values.push(due_date); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
        values.push(taskId);

        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Log the activity
        await logActivity(`Updated task ${taskId}`, userId || null, userName || null);

        res.json({
            message: `Task ID ${taskId} updated successfully.`,
            updatedId: taskId
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Failed to update task.' });
    }
};

// DELETE: Delete a task (Remote's clean logic combined with your check)
const deleteTask = async (req, res) => {
    const taskId = req.params.id;
    const { userId, userName } = req.body;
    
    try {
        const sql = 'DELETE FROM tasks WHERE id = ?';
        const [result] = await db.query(sql, [taskId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Log the activity
        await logActivity(`Deleted task ${taskId}`, userId || null, userName || null);

        res.json({
            message: `Task ID ${taskId} deleted successfully.`,
            deletedId: taskId
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Failed to delete task.' });
    }
};

module.exports = {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask
};