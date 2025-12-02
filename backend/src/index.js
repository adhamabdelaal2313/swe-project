// 1. Load imports and database configuration
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Ensure CORS is imported

// Initialize database connection (this will run the check inside db.config.js)
const db = require('./config/db.config'); 

// Feature-first architecture: Import all routes
const tasksRoutes = require('./tasks/tasks.routes');
const kanbanRoutes = require('./kanban/kanban.routes');
const teamsRoutes = require('./teams/teams.routes');
const dashboardRoutes = require('./dashboard/dashboard.routes');

const app = express();

// 2. Setup Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Allows Express to read JSON data from requests

const PORT = process.env.PORT || 3000;

// 3. The server's main page message
app.get('/', (req, res) => {
    res.send('TeamFlow Backend is ON! 🌟');
});

// 4. Setup Routers for API requests (Feature-first architecture)
app.use('/api/tasks', tasksRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/dashboard', dashboardRoutes); 

// 5. Database Connection Check and Server Start (Combining the best of both)
// This uses your local branch's connection logic for reliability.
db.getConnection()
    .then(connection => {
        connection.release(); 
        console.log('Database connection is active! 🥳');
        app.listen(PORT, () => {
            console.log(`Server is happily listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
    });