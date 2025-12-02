const db = require('../config/db.config');

const logActivity = async (action) => {
  if (!action) return;

  try {
    await db.query('INSERT INTO activities (action) VALUES (?)', [action]);
  } catch (error) {
    console.error('Activity log failed:', error.message);
  }
};

module.exports = logActivity;

