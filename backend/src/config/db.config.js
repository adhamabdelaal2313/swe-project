const mysql = require("mysql2/promise");
require('dotenv').config();

// Get the connection string from .env
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    throw new Error("❌ DATABASE_URL is missing from .env file");
}

// Create the connection pool with resilience options
const db = mysql.createPool({
  uri: dbUrl,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value is 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection on startup
db.query("SELECT 1")
  .then(() => console.log("Connected to Teamflow DB ✅"))
  .catch(err => console.error("Failed to connect to Railway DB ❌", err));

module.exports = db;