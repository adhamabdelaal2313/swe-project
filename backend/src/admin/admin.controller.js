const db = require('../config/db.config');
const logActivity = require('../utils/activityLogger');
const bcrypt = require('bcryptjs');

// GET: Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, name, email, role, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// GET: Get single user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      `SELECT id, name, email, role, created_at 
       FROM users 
       WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

// PUT: Update user role and details
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const adminUser = req.user; // From auth middleware

    // Validate role if provided
    const validRoles = ['admin', 'user'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "admin" or "user"' });
    }

    // Check if user exists
    const [existingUsers] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingUser = existingUsers[0];

    // Prevent admin from removing their own admin role
    if (role === 'user' && existingUser.role === 'admin' && adminUser.id === parseInt(id)) {
      return res.status(400).json({ message: 'You cannot remove your own admin role' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      // Check if email is already taken by another user
      const [emailCheck] = await db.query(
        'SELECT id FROM users WHERE LOWER(email) = ? AND id != ?',
        [normalizedEmail, id]
      );
      if (emailCheck.length > 0) {
        return res.status(409).json({ message: 'Email already in use by another user' });
      }
      updates.push('email = ?');
      values.push(normalizedEmail);
    }

    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);

    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Log activity
    const changes = [];
    if (name !== undefined && name !== existingUser.name) changes.push(`name: ${existingUser.name} → ${name}`);
    if (email !== undefined && email !== existingUser.email) changes.push(`email: ${existingUser.email} → ${email}`);
    if (role !== undefined && role !== existingUser.role) changes.push(`role: ${existingUser.role} → ${role}`);

    if (changes.length > 0) {
      await logActivity(
        `Admin ${adminUser.name} updated user ${existingUser.name}: ${changes.join(', ')}`,
        adminUser.id,
        adminUser.name
      );
    }

    // Fetch updated user
    const [updatedUsers] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json(updatedUsers[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

// PUT: Reset user password
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const adminUser = req.user;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if user exists
    const [users] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetUser = users[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);

    // Update password
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

    // Log activity
    await logActivity(
      `Admin ${adminUser.name} reset password for user ${targetUser.name} (${targetUser.email})`,
      adminUser.id,
      adminUser.name
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};

// DELETE: Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = req.user;

    // Prevent admin from deleting themselves
    if (adminUser.id === parseInt(id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Check if user exists
    const [users] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetUser = users[0];

    // Delete user (cascade will handle related records)
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    // Log activity
    await logActivity(
      `Admin ${adminUser.name} deleted user ${targetUser.name} (${targetUser.email})`,
      adminUser.id,
      adminUser.name
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// GET: Get user statistics
const getUserStats = async (req, res) => {
  try {
    const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
    const [adminUsers] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    const [regularUsers] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const [recentUsers] = await db.query(
      `SELECT COUNT(*) as count FROM users 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    res.json({
      total: totalUsers[0].count,
      admins: adminUsers[0].count,
      users: regularUsers[0].count,
      recent: recentUsers[0].count
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  resetUserPassword,
  deleteUser,
  getUserStats
};

