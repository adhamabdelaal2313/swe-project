const db = require('../config/db.config');
const logActivity = require('../utils/activityLogger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// Password complexity regex: 1 upper, 1 lower, 1 digit, 1 special, min 8 chars
// Allows all printable ASCII special characters including spaces, #, ^, ", ', etc.
// Note: - must be escaped or at end of character class
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~` ])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~` ]{8,}$/;

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordRegex).required().messages({
    'string.pattern.base': 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
  })
});

// Helper: Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// POST: Login user
const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    email = email.trim().toLowerCase();

    // Query user from database
    const [users] = await db.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log(`Login attempt failed: Email ${email} not found`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    
    // Check password
    let isMatch = await bcrypt.compare(password, user.password);
    
    // Fallback for demo/plain-text passwords (not for production)
    if (!isMatch && !user.password.startsWith('$2')) {
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      console.log(`Login attempt failed: Password mismatch for ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    await logActivity(`User logged in: ${user.email}`, user.id, user.name);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// POST: Register new user
const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = value;

    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    const newUser = {
      id: result.insertId,
      name,
      email,
      role: 'user'
    };

    const token = generateToken(newUser);

    await logActivity(`New user registered: ${email}`);

    res.status(201).json({
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// GET: Get current user (for session validation)
const getCurrentUser = async (req, res) => {
  try {
    // This will be used after auth middleware, so user will be in req.user
    const userId = req.user ? req.user.id : (req.query.userId || req.headers['user-id']);
    
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

// GET: Refresh session and get new token with latest role
const refreshSession = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [users] = await db.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Refresh session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST: Logout user (log activity)
const logout = async (req, res) => {
  try {
    const { email, userId } = req.body;
    
    let userName = null;
    if (userId) {
      try {
        const [users] = await db.query('SELECT name FROM users WHERE id = ?', [userId]);
        if (users.length > 0) {
          userName = users[0].name;
        }
      } catch (err) {}
    }
    
    await logActivity(`User logged out: ${email || 'Unknown'}`, userId || null, userName);

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
  logout,
  refreshSession
};
