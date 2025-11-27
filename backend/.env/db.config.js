// 1. This code is for connecting to MySQL
const mysql = require('mysql2');

// 2. We use the secrets from your .env file here
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
     password: 'Hanin_Hazem_2005',
     database: 'teamflow_project',
     connectionLimit: 10,
});

// 3. Simple Check to see if the connection is successful!
pool.promise().getConnection()
     .then(connection => {
     console.log("Database connection successful! 🥳");
     connection.release();
     })
     .catch(err => {
     console.error("Database connection FAILED:", err.message);
     console.error("Please check your MySQL password and if MySQL is running.");
     });

// 4. We send this connection pool out so other files can use it
module.exports = pool.promise(); 