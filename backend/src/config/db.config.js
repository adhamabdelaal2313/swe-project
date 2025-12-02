<<<<<<< HEAD
const mysql = require('mysql2/promise'); 

// TEMPORARY: HARDCODED CREDENTIALS FOR TESTING ONLY
// We are bypassing process.env because it is failing to load.
const DB_HOST = 'shortline.proxy.rlwy.net';
const DB_USER = 'root'; 
const DB_PASSWORD = 'FPHNKCPheHyghwLLaNchHxzXDNsjbjUz';
const DB_NAME = 'teamflow_project';
const DB_PORT = 25116; 

// Create the connection pool using the hardcoded variables
const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT, 

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
=======
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
>>>>>>> bd9139b48f13aa53170d743a253a4ca230691792
