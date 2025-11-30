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