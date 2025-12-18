const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask
} = require('../tasks/tasks.controller');
const { auth } = require('../middleware/auth');

// All kanban routes require authentication
router.use(auth);

// Map /api/kanban/tasks to the tasks controller
router.get('/tasks', getAllTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

module.exports = router;
