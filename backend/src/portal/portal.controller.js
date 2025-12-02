const db = require('../config/db.config');
const logActivity = require('../utils/activityLogger');

// POST: Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Query user from database
    const [users] = await db.query(
      'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    
    await logActivity(`User logged in: ${user.email}`, user.id, user.name);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// POST: Register new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, 'user']
    );

    await logActivity(`New user registered: ${email}`);

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      role: 'user'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// GET: Get current user (for session validation)
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['user-id'];
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const [users] = await db.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST: Logout user (log activity)
const logout = async (req, res) => {
  try {
    const { email, userId } = req.body;
    
    // Try to get user name if userId is provided
    let userName = null;
    if (userId) {
      try {
        const [users] = await db.query('SELECT name FROM users WHERE id = ?', [userId]);
        if (users.length > 0) {
          userName = users[0].name;
        }
      } catch (err) {
        // Ignore error, just use email
      }
    }
    
    if (email) {
      await logActivity(`User logged out: ${email}`, userId || null, userName);
    } else {
      await logActivity('User logged out (no email provided)', userId || null, userName);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout log error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

module.exports = {
  login,
  register,
  getCurrentUser,
  logout
};

