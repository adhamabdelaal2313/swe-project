const { Pool } = require("pg");
require('dotenv').config();

// Get the connection string from .env
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    throw new Error("❌ DATABASE_URL is missing from .env file");
}

// Create the connection pool for Postgres
const pool = new Pool({
  connectionString: dbUrl,
  // Add SSL if connecting to remote Supabase (usually recommended/required)
  ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 60000,
});

// Test connection on startup
pool.query("SELECT 1")
  .then(() => console.log("Connected to Supabase DB ✅"))
  .catch(err => console.error("Failed to connect to Supabase DB ❌", err));

// Wrapper to simulate mysql2 behavior
const db = {
  query: async (sql, params = []) => {
    // 1. Convert mysql '?' to pg '$1, $2, ...'
    let i = 1;
    let pgSql = sql.replace(/\?/g, () => `$${i++}`);

    // 2. Automatically append RETURNING * to INSERT statements if not present
    // This is needed to simulate result.insertId
    if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
      pgSql += ' RETURNING *';
    }
    
    // 3. Execute query
    const result = await pool.query(pgSql, params);
    
    // 4. Create a mock result object for data modification queries
    // Many controllers expect result.insertId or result.affectedRows
    const mockMeta = {
      affectedRows: result.rowCount,
      insertId: result.rows[0] ? (result.rows[0].id || result.rows[0].team_id || result.rows[0].item_id || result.rows[0].taskId) : null,
      rowCount: result.rowCount
    };

    // 5. Ensure count results are numbers, not strings (Postgres returns bigint as string)
    const rows = result.rows.map(row => {
      const newRow = { ...row };
      for (const key in newRow) {
        if (key.toLowerCase().includes('count') && typeof newRow[key] === 'string') {
          newRow[key] = parseInt(newRow[key], 10);
        }
      }
      return newRow;
    });

    // 6. Return results in mysql2 compatible format
    // mysql2: [rows, fields] for SELECT
    // mysql2: [info, undefined] for INSERT/UPDATE/DELETE
    const isModification = ['INSERT', 'UPDATE', 'DELETE'].includes(pgSql.trim().split(' ')[0].toUpperCase());
    
    if (isModification) {
       return [mockMeta, undefined];
    }
    
    return [rows, result.fields];
  },
  execute: async (sql, params = []) => {
    return db.query(sql, params);
  }
};

module.exports = db;