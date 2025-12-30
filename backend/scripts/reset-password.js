const mysql = require("mysql2/promise");
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetPassword() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error("❌ DATABASE_URL is missing from .env file");
  }

  // Get email and new password from command line args
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.log('Usage: node scripts/reset-password.js <email> <new-password>');
    process.exit(1);
  }

  const connection = await mysql.createConnection(dbUrl);

  try {
    // Find user
    const [users] = await connection.query(
      'SELECT id, email, password FROM users WHERE LOWER(TRIM(email)) = ?',
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    const user = users[0];
    console.log(`Found user: ${user.email} (ID: ${user.id})`);
    console.log(`Current password hash: ${user.password.substring(0, 20)}...`);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await connection.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, user.id]
    );

    console.log(`✅ Password updated successfully for ${user.email}`);
    console.log(`New password hash: ${hashedPassword.substring(0, 20)}...`);

  } catch (error) {
    console.error("❌ Error resetting password:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run if called directly
if (require.main === module) {
  resetPassword()
    .then(() => {
      console.log("✅ Password reset complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Password reset failed:", error);
      process.exit(1);
    });
}

module.exports = resetPassword;

