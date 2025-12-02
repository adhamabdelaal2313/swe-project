const db = require('../config/db.config');

const logActivity = async (action, userId = null, userName = null) => {
  if (!action) return;

  try {
    await db.query(
      'INSERT INTO activities (action, user_id, user_name) VALUES (?, ?, ?)',
      [action, userId, userName]
    );
  } catch (error) {
    console.error('Activity log failed:', error.message);
  }
};

module.exports = logActivity;

