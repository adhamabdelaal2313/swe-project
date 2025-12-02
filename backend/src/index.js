<<<<<<< HEAD
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors'); // <--- NEW REQUIREMENT
const db = require('./config/db.config'); 
const taskRoutes = require('./routes/taskRoutes');


=======
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
require('./config/db.config.js');
>>>>>>> bd9139b48f13aa53170d743a253a4ca230691792

const app = express();
<<<<<<< HEAD

app.use(cors());

app.use(express.json());

// Task routes
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 3000;
//database connection check and server start
db.getConnection()
    .then(connection => {
        connection.release(); 
        console.log('Server is happily listening on port 3000. Database connection is active! 🥳');
        app.listen(PORT, () => {
            // ...
        });
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
    });
=======
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

// 5. Tell the server to listen for requests <--- LAST BLOCK
app.listen(PORT, () => {
    console.log(`Server is happily listening on port ${PORT}`);
});



>>>>>>> bd9139b48f13aa53170d743a253a4ca230691792
