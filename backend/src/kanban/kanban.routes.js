const express = require('express');
const router = express.Router();
const controller = require('../controllers/kanban.controller');

// Task Routes
router.get('/tasks', controller.getTasks);
router.post('/tasks', controller.createTask);
router.put('/tasks/:id', controller.updateTaskStatus);
router.delete('/tasks/:id', controller.deleteTask);

// Dropdown Helper Routes
router.get('/users', controller.getUsers); // Populates Assignee
router.get('/teams', controller.getTeams); // Populates Team

module.exports = router;