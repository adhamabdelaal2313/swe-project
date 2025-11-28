import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Safety check: ensure the URL exists
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    throw new Error("❌ DATABASE_URL is missing from .env file");
}

export const db = mysql.createPool(dbUrl);

db.query("SELECT 1")
  .then(() => console.log("Connected to Teamflow DB✅"))
  .catch(err => console.error("Failed to connect to Railway DB❌", err));