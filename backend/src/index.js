// 1. Load imports and start the database connection check
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Feature-first architecture: Import routes from each feature folder
const tasksRoutes = require('./tasks/tasks.routes');
const kanbanRoutes = require('./kanban/kanban.routes');
const teamsRoutes = require('./teams/teams.routes');
const dashboardRoutes = require('./dashboard/dashboard.routes');

// Initialize database connection
// 🚨 CRITICAL DEBUGGING STEP: If you still see no messages, try commenting this line out:
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
app.use('/api/tasks', tasksRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/dashboard', dashboardRoutes); 

// --- 5. GLOBAL ERROR HANDLING ---

// 5a. 404 Handler (Catch any request that didn't match a route)
app.use((req, res, next) => {
    res.status(404).send("404: Route Not Found");
});

// 5b. Global Error Handler (CRITICAL: Catches all synchronous and asynchronous errors)
// This is an Express error handling middleware (four arguments)
// 
app.use((err, req, res, next) => {
    // 💡 This is the line that will print the hidden error!
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
        errorDetail: err.message 
    });
});

// 6. Tell the server to listen for requests <--- LAST BLOCK
app.listen(PORT, () => {
    console.log(`Server is happily listening on port ${PORT}`);
});