const express = require('express');
const router = express.Router();
const controller = require('./kanban.controller');

// Task CRUD
router.get('/tasks', controller.getTasks);
router.post('/tasks', controller.createTask);
router.put('/tasks/:id', controller.updateTaskStatus);
router.delete('/tasks/:id', controller.deleteTask);

// Dropdown Data
router.get('/users', controller.getUsers); // For Assignee List
router.get('/teams', controller.getTeams); // For Team List

module.exports = router;