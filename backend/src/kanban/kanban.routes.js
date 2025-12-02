const express = require('express');
const cors = require('cors');
const controller = require('./kanban.controller');

// Initialize the App
const app = express();

// Standard Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---
const router = express.Router();

// Task Routes (CRUD)
router.get('/tasks', controller.getTasks);
router.post('/tasks', controller.createTask);
router.put('/tasks/:id', controller.updateTaskStatus);
router.delete('/tasks/:id', controller.deleteTask);

// Dropdown Helper Routes (For the "Create Task" modal)
router.get('/users', controller.getUsers);
router.get('/teams', controller.getTeams);

// Register Routes under /api prefix
app.use('/api', router);

// --- START SERVER ON PORT 3000 ---
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`✅ Kanban Backend is running on port ${PORT}`);
});

module.exports = router;