const express = require('express');
const router = express.Router();
const controller = require('./kanban.controller');

// Kanban task routes (mounted under /api/kanban)
router.get('/tasks', controller.getKanbanTasks);
router.post('/tasks', controller.createKanbanTask);
router.put('/tasks/:id', controller.updateKanbanTaskStatus);
router.delete('/tasks/:id', controller.deleteKanbanTask);

module.exports = router;