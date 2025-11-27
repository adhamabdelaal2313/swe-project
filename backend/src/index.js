// 1. Load your secrets and start the database connection check
require('dotenv').config();
require('./config/db.config.js'); // This is the file we just fixed!

// 2. Start the Express server part
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// 3. The server's main page message
app.get('/', (req, res) => {
    res.send('TeamFlow Backend is ON! 🌟');
});

// 4. Tell the server to listen for requests
app.listen(PORT, () => {
    console.log(`Server is happily listening on port ${PORT}`);
});