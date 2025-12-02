const db = require('../config/db.config');
const logActivity = require('../utils/activityLogger');

// GET: Fetch all tasks
const getAllTasks = async (req, res) => {
    try {
        const sql = 'SELECT * FROM tasks';
        const [tasks] = await db.query(sql);
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ 
            message: 'Failed to fetch tasks from the database.',
            error: error.message 
        });
    }
};

// POST: Create a new task
const createTask = async (req, res) => {
    const { title, description, userId, userName } = req.body; 

    if (!title) {
        return res.status(400).json({ message: 'Task title is required!' });
    }

    try {
        const sql = 'INSERT INTO tasks (title, description) VALUES (?, ?)';
        const [result] = await db.query(sql, [title, description]);

        await logActivity(`Created task: ${title} (#${result.insertId})`, userId || null, userName || null);

        res.status(201).json({
            message: 'Task created successfully! 🎉',
            taskId: result.insertId,
            title: title
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ 
            message: 'Failed to create task in the database.',
            error: error.message 
        });
    }
};

// PUT: Update a task
const updateTask = async (req, res) => {
    const taskId = req.params.id;
    const { title, description, is_completed } = req.body; 

    if (!title && !description && is_completed === undefined) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    try {
        const fields = [];
        const values = [];

        if (title) {
            fields.push('title = ?');
            values.push(title);
        }
        if (description) {
            fields.push('description = ?');
            values.push(description);
        }
        if (is_completed !== undefined) {
            fields.push('is_completed = ?');
            values.push(is_completed ? 1 : 0); 
        }

        const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
        values.push(taskId);

        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: `Task with ID ${taskId} not found or no new changes provided.` 
            });
        }

        const { userId, userName } = req.body;
        await logActivity(`Updated task ${taskId}`, userId || null, userName || null);

        res.json({
            message: `Task ID ${taskId} updated successfully.`,
            updatedId: taskId
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ 
            message: 'Failed to update task in the database.',
            error: error.message 
        });
    }
};

// DELETE: Delete a task
const deleteTask = async (req, res) => {
    const taskId = req.params.id; 

    try {
        const sql = 'DELETE FROM tasks WHERE id = ?';
        const [result] = await db.query(sql, [taskId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Task with ID ${taskId} not found.` });
        }

        const { userId, userName } = req.body;
        await logActivity(`Deleted task ${taskId}`, userId || null, userName || null);

        res.json({
            message: `Task ID ${taskId} deleted successfully.`,
            deletedId: taskId
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ 
            message: 'Failed to delete task from the database.',
            error: error.message 
        });
    }
};

module.exports = {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask
};

