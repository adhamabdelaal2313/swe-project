// 1. Load imports and start the database connection check
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Feature-first architecture: Import routes from each feature folder
const portalRoutes = require('./portal/portal.routes');
const tasksRoutes = require('./tasks/tasks.routes');
const kanbanRoutes = require('./kanban/kanban.routes');
const teamsRoutes = require('./teams/teams.routes');
const dashboardRoutes = require('./dashboard/dashboard.routes');

// Initialize database connection
require('./config/db.config.js');

// 2. Start the Express server part
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Allows Express to read JSON data from requests
const PORT = process.env.PORT || 3000;

// 3. The server's main page message
app.get('/', (req, res) => {
    res.send('TeamFlow Backend is ON! 🌟');
});

// 4. Setup Routers for API requests (Feature-first architecture)
app.use('/api/portal', portalRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/dashboard', dashboardRoutes); 

// 5. Tell the server to listen for requests <--- LAST BLOCK
app.listen(PORT, () => {
    console.log(`Server is happily listening on port ${PORT}`);
});



