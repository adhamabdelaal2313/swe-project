const express = require('express');
const router = express.Router();
const db = require('../config/db.config'); //imports database

// GET /api/tasks - This route will fetch ALL tasks
router.get('/', async (req, res) => {
    try {
        // 1. Define the SQL query to select all data from the 'tasks' table
        const sql = 'SELECT * FROM tasks';

        // 2. Execute the query using the database connection pool
        // The result is an array: [rows, fields]
        const [tasks] = await db.query(sql);

        // 3. Send the tasks back to the client as a JSON response
        res.json(tasks);

    } catch (error) {
        // 4. If an error occurs (e.g., table name is wrong, connection drops), log it and send an error response
        console.error('Error fetching tasks:', error);
        res.status(500).json({ 
            message: 'Failed to fetch tasks from the database.',
            error: error.message 
        });
    }
});
// POST /api/tasks - This route will create a new task
router.post('/', async (req, res) => {
    // 1. Get the data (title and description) sent from the client
    const { title, description } = req.body; 

    if (!title) {
        return res.status(400).json({ message: 'Task title is required!' });
    }

    try {
        // 2. Define the SQL query to insert the new task data
        const sql = 'INSERT INTO tasks (title, description) VALUES (?, ?)';

        // 3. The data array matches the '?' placeholders in the query
        const [result] = await db.query(sql, [title, description]);

        // 4. Send back a success message with the ID of the new task
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
});
// DELETE /api/tasks/:id - This route will delete a specific task
router.delete('/:id', async (req, res) => {
    // 1. Get the Task ID from the URL parameter (e.g., /api/tasks/5)
    const taskId = req.params.id; 

    try {
        // 2. Define the SQL query to delete the task where the ID matches
        const sql = 'DELETE FROM tasks WHERE id = ?';

        // 3. Execute the query using the ID as the placeholder value
        const [result] = await db.query(sql, [taskId]);

        // 4. Check if a task was actually deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Task with ID ${taskId} not found.` });
        }

        // 5. Send back a success message
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
});
module.exports = router;