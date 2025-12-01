// 1. Load imports and start the database connection check
require('dotenv').config();
const express = require('express'); 
const taskRoutes = require('./routes/taskRoutes'); 
require('./config/db.config.js'); 

// 2. Start the Express server part
const app = express();
app.use(express.json()); // Allows Express to read JSON data from requests
const PORT = process.env.PORT || 3000;

// 3. The server's main page message
app.get('/', (req, res) => {
    res.send('TeamFlow Backend is ON! 🌟');
});

// 4. Setup Router for API requests <--- app.use must be BEFORE app.listen
app.use('/api/tasks', taskRoutes); 

// 5. Tell the server to listen for requests <--- LAST BLOCK
app.listen(PORT, () => {
    console.log(`Server is happily listening on port ${PORT}`);
});



