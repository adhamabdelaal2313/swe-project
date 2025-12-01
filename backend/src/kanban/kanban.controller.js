const db = require('../config/db.config');

// GET: Get all tasks for kanban board
const getKanbanTasks = async (req, res) => {
  try {
    const sql = "SELECT * FROM tasks ORDER BY created_at DESC";
    const [data] = await db.query(sql);
    
    // Format tags from comma-separated string to array
    const formattedData = data.map(task => ({
      ...task,
      tags: task.tags ? task.tags.split(',') : []
    }));
    
    res.json(formattedData);
  } catch (err) {
    console.error("❌ READ ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// POST: Create a new task
const createKanbanTask = async (req, res) => {
  try {
    const sql = "INSERT INTO tasks (`title`, `description`, `status`, `priority`, `team`, `assignee`, `tags`, `due_date`) VALUES (?)";
    
    const tagsString = Array.isArray(req.body.tags) ? req.body.tags.join(',') : '';
    
    const values = [
      req.body.title,
      req.body.description || '',
      req.body.status || 'TODO',
      req.body.priority || 'MEDIUM',
      req.body.team || 'General',
      req.body.assignee || 'Unassigned',
      tagsString,
      req.body.due_date || ''
    ];

    const [result] = await db.query(sql, [values]);
    res.json({ message: "Task created", id: result.insertId });
  } catch (err) {
    console.error("❌ SAVE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// PUT: Update task status
const updateKanbanTaskStatus = async (req, res) => {
  try {
    const sql = "UPDATE tasks SET `status` = ? WHERE id = ?";
    await db.query(sql, [req.body.status, req.params.id]);
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("❌ UPDATE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// DELETE: Delete a task
const deleteKanbanTask = async (req, res) => {
  try {
    const sql = "DELETE FROM tasks WHERE id = ?";
    await db.query(sql, [req.params.id]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getKanbanTasks,
  createKanbanTask,
  updateKanbanTaskStatus,
  deleteKanbanTask
};

