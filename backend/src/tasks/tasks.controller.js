const db = require('../config/db.config');
const logActivity = require('../utils/activityLogger');
const Joi = require('joi');

// Validation Schema for Tasks
const taskSchema = Joi.object({
  title: Joi.string().required().max(255),
  description: Joi.string().allow('', null),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').default('TODO'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('MEDIUM'),
  team_id: Joi.number().integer().allow(null),
  assignee_id: Joi.number().integer().allow(null),
  tags: Joi.array().items(Joi.string()).default([]),
  due_date: Joi.string().allow('', null),
  is_completed: Joi.boolean().default(false)
});

// GET: Fetch all tasks with optional filters
const getAllTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { team_id, assignee_id, status } = req.query;
        
        let sql = `
            SELECT t.*, u.name as assignee_name, tm.team_name 
            FROM tasks t
            LEFT JOIN users u ON t.assignee_id = u.id
            LEFT JOIN teams tm ON t.team_id = tm.team_id
        `;
        
        let whereConditions = ["1=1"];
        const params = [];

        // Security: If not admin, restrict to user's teams or assigned tasks
        if (userRole !== 'admin') {
            sql += ` LEFT JOIN team_members tm2 ON t.team_id = tm2.team_id AND tm2.user_id = ? `;
            // Users can only see:
            // 1. Tasks from teams they're members of (tm2.id IS NOT NULL)
            // 2. Tasks assigned to them (t.assignee_id = userId)
            // Private tasks (team_id IS NULL) are only visible if assigned to the user
            whereConditions.push("(tm2.id IS NOT NULL OR t.assignee_id = ?)");
            params.push(userId, userId);
        }

        // Additional security: If filtering by team_id, ensure user is a member (unless admin)
        if (team_id && userRole !== 'admin') {
            // Verify user is a member of this team
            whereConditions.push("EXISTS (SELECT 1 FROM team_members tm3 WHERE tm3.team_id = ? AND tm3.user_id = ?)");
            params.push(team_id, userId);
        } else if (team_id) {
            whereConditions.push("t.team_id = ?");
            params.push(team_id);
        }
        if (assignee_id) {
            whereConditions.push("t.assignee_id = ?");
            params.push(assignee_id);
        }
        if (status) {
            whereConditions.push("t.status = ?");
            params.push(status);
        }

        sql += ` WHERE ${whereConditions.join(" AND ")} ORDER BY t.created_at DESC`;

        const [tasks] = await db.query(sql, params);
        
        // Format tags
        const formattedTasks = tasks.map(task => ({
            ...task,
            tags: task.tags ? task.tags.split(',') : []
        }));

        res.json(formattedTasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
    }
};

// POST: Create a new task
const createTask = async (req, res) => {
    try {
        const { error, value } = taskSchema.validate(req.body, { stripUnknown: true });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { title, description, status, priority, team_id, assignee_id, tags, due_date } = value;
        const tagsString = tags.join(',');

        const sql = `
            INSERT INTO tasks (title, description, status, priority, team_id, assignee_id, tags, due_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(sql, [
            title, description, status, priority, team_id, assignee_id, tagsString, due_date
        ]);

        const userId = req.user ? req.user.id : null;
        const userName = req.user ? req.user.name : null;
        await logActivity(`Created task: ${title} (#${result.insertId})`, userId, userName);

        res.status(201).json({
            message: 'Task created successfully! 🎉',
            taskId: result.insertId,
            title
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Failed to create task', error: error.message });
    }
};

// PUT: Update a task
const updateTask = async (req, res) => {
    const taskId = req.params.id;
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Security: Check if user has access to this task
        if (userRole !== 'admin') {
            const [taskCheck] = await db.query(`
                SELECT t.*, 
                       EXISTS(SELECT 1 FROM team_members tm WHERE tm.team_id = t.team_id AND tm.user_id = ?) as is_team_member
                FROM tasks t
                WHERE t.id = ?
            `, [userId, taskId]);

            if (taskCheck.length === 0) {
                return res.status(404).json({ message: `Task with ID ${taskId} not found.` });
            }

            const task = taskCheck[0];
            // User can only update tasks:
            // 1. From teams they're members of, OR
            // 2. Assigned to them
            const canUpdate = task.is_team_member || task.assignee_id === userId;
            
            if (!canUpdate) {
                return res.status(403).json({ message: 'You do not have permission to update this task.' });
            }
        }

        const { error, value } = taskSchema.fork(
            ['title', 'description', 'status', 'priority', 'team_id', 'assignee_id', 'tags', 'due_date', 'is_completed'], 
            (schema) => schema.optional()
        ).validate(req.body, { stripUnknown: true });

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        if (Object.keys(value).length === 0) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        const fields = [];
        const values = [];

        for (const [key, val] of Object.entries(value)) {
            if (key === 'tags') {
                fields.push('tags = ?');
                values.push(val.join(','));
            } else {
                fields.push(`${key} = ?`);
                values.push(val);
            }
        }

        const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
        values.push(taskId);

        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Task with ID ${taskId} not found.` });
        }

        const userName = req.user ? req.user.name : null;
        await logActivity(`Updated task ${taskId}`, userId, userName);

        res.json({ message: `Task ID ${taskId} updated successfully.`, updatedId: taskId });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Failed to update task', error: error.message });
    }
};

// DELETE: Delete a task
const deleteTask = async (req, res) => {
    const taskId = req.params.id; 
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Security: Check if user has access to this task
        if (userRole !== 'admin') {
            const [taskCheck] = await db.query(`
                SELECT t.*, 
                       EXISTS(SELECT 1 FROM team_members tm WHERE tm.team_id = t.team_id AND tm.user_id = ?) as is_team_member
                FROM tasks t
                WHERE t.id = ?
            `, [userId, taskId]);

            if (taskCheck.length === 0) {
                return res.status(404).json({ message: `Task with ID ${taskId} not found.` });
            }

            const task = taskCheck[0];
            // User can only delete tasks:
            // 1. From teams they're members of, OR
            // 2. Assigned to them
            const canDelete = task.is_team_member || task.assignee_id === userId;
            
            if (!canDelete) {
                return res.status(403).json({ message: 'You do not have permission to delete this task.' });
            }
        }

        const sql = 'DELETE FROM tasks WHERE id = ?';
        const [result] = await db.query(sql, [taskId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Task with ID ${taskId} not found.` });
        }

        const userName = req.user ? req.user.name : null;
        await logActivity(`Deleted task ${taskId}`, userId, userName);

        res.json({ message: `Task ID ${taskId} deleted successfully.`, deletedId: taskId });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Failed to delete task', error: error.message });
    }
};

module.exports = {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask
};
