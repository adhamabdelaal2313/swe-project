const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors'); // <--- NEW REQUIREMENT
const db = require('./config/db.config'); 
const taskRoutes = require('./routes/taskRoutes');



const app = express();

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