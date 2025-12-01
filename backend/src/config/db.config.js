const mysql = require("mysql2/promise");
require('dotenv').config();

// Get the connection string from .env
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    throw new Error("❌ DATABASE_URL is missing from .env file");
}

// Create the connection pool
const db = mysql.createPool(dbUrl);

// Test connection on startup
db.query("SELECT 1")
  .then(() => console.log("Connected to Teamflow DB ✅"))
  .catch(err => console.error("Failed to connect to Railway DB ❌", err));

module.exports = db;