const express = require('express');
const router = express.Router();
const {
  getKanbanTasks,
  createKanbanTask,
  updateKanbanTaskStatus,
  deleteKanbanTask
} = require('./kanban.controller');

// Route definitions - map URLs to controller functions
router.get('/tasks', getKanbanTasks);
router.post('/tasks', createKanbanTask);
router.put('/tasks/:id', updateKanbanTaskStatus);
router.delete('/tasks/:id', deleteKanbanTask);

module.exports = router;

