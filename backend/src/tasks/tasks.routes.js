const express = require('express');
const router = express.Router();
const tasksController = require('./tasks.controller');

// All routes are defined here, linking to the controller functions
router.get('/', tasksController.getAllTasks);
router.post('/', tasksController.createTask);
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

module.exports = router;

