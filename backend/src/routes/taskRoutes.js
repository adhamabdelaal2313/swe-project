const express = require('express');
const router = express.Router();
const db = require('../config/db.config');

// GET /api/tasks - Fetch all tasks (with optional search query)
router.get('/', async (req, res) => {
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
        // Add the same search term for all columns
        params = [searchTerm, searchTerm, searchTerm, searchTerm]; 
    }

    sql += ` ORDER BY created_at DESC`; // Order by most recent first

    try {
        // Execute the query
        const [tasks] = await db.query(sql, params);

        // Check if any tasks were returned and send the data
        if (tasks.length === 0 && search) {
            // If searching and nothing is found, send an empty array
            return res.status(200).json([]);
        }

        // Send the tasks array back to the frontend
        res.status(200).json(tasks);
    } catch (error) {
        console.error('DATABASE ERROR during task fetching:', error);
        // Return a 500 status code with the error details
        res.status(500).json({ 
            message: 'Failed to fetch tasks due to a critical server error.',
            error: error.message 
        });
    }
});
// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
    // Extract all possible fields from the request body
    const { title, description, status, priority, team, assignee, tags, due_date } = req.body;

    // CRITICAL CHECK: Ensure a title is provided
    if (!title) {
        return res.status(400).json({ message: 'Title is required for a new task.' });
    }

    const sql = `
        INSERT INTO tasks (title, description, status, priority, team, assignee, tags, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Define the parameters array, using defaults or NULL if fields are missing
    const params = [
        title,
        description || null, // Allow description to be null
        status || 'TODO',     // Default to TODO
        priority || 'MEDIUM', // Default to MEDIUM
        team || 'General',    // Default to General
        assignee || 'Unassigned', // Default to Unassigned
        tags || null,         // Allow tags to be null
        due_date || null      // Allow due_date to be null
    ];

    try {
        // Execute the query
        const [result] = await db.query(sql, params);

        // Return the ID of the newly created task
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Task created successfully!' 
        });
    } catch (error) {
        console.error('DATABASE ERROR during task creation:', error);
        res.status(500).json({ 
            message: 'Failed to create task due to a critical server error.',
            error: error.message 
        });
    }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', async (req, res) => {
    const taskId = req.params.id;
    // 1. Get all potential fields to update
    const { title, description, is_completed, status, priority, team, assignee, tags, due_date } = req.body;

    try {
        // 2. Build the query dynamically (Only update fields that are sent)
        const fields = [];
        const values = [];

        if (title !== undefined) { fields.push('title = ?'); values.push(title); }
        if (description !== undefined) { fields.push('description = ?'); values.push(description); }
        if (is_completed !== undefined) { fields.push('is_completed = ?'); values.push(is_completed); }
        
        // New Fields
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

        res.json({ message: 'Task updated successfully.' });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Failed to update task.' });
    }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
    const taskId = req.params.id;
    try {
        const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [taskId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        res.json({ message: 'Task deleted successfully.' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Failed to delete task.' });
    }
});

module.exports = router;