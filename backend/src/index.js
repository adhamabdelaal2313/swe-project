// 1. Load imports and database configuration
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Ensure CORS is imported

// Initialize database connection
const db = require('./config/db.config');

// Feature-first architecture: Import all routes
const portalRoutes = require('./portal/portal.routes');
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
app.use('/api/portal', portalRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 5. Database Connection Check and Server Start
// This combines the database connection check with server startup
db.getConnection()
    .then(connection => {
        connection.release();
        console.log('Database connection is active! 🥳');
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is happily listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
        // Optionally exit the process if DB connection is critical
        // process.exit(1);
    });

// --- 6. GLOBAL ERROR HANDLING ---

// 6a. 404 Handler (Catch any request that didn't match a route)
app.use((req, res, next) => {
    res.status(404).send("404: Route Not Found");
});

// 6b. Global Error Handler (CRITICAL: Catches all synchronous and asynchronous errors)
app.use((err, req, res, next) => {
    // Log the error for debugging
    console.error("🚨 GLOBAL CAUGHT ERROR: ", err.stack);
    
    // Check if headers have already been sent to prevent crash
    if (res.headersSent) {
        return next(err);
    }
    
    // Send a generic 500 response (or the specific status if available)
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: 'A critical server error occurred.',
        // For debugging, send a simplified message
        errorDetail: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});