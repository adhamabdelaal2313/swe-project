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
    password = password.trim(); // Trim password to handle whitespace issues

    // Query user from database - try multiple approaches for email matching
    let [users] = await db.query(
      'SELECT id, name, email, password, role FROM users WHERE LOWER(TRIM(email)) = ?',
      [email]
    );

    // Fallback: try case-insensitive match without TRIM if first query fails
    if (users.length === 0) {
      [users] = await db.query(
        'SELECT id, name, email, password, role FROM users WHERE LOWER(email) = ?',
        [email]
      );
    }

    // Fallback: try exact match if still not found
    if (users.length === 0) {
      [users] = await db.query(
        'SELECT id, name, email, password, role FROM users WHERE email = ?',
        [email]
      );
    }

    if (users.length === 0) {
      console.log(`Login attempt failed: Email ${email} not found`);
      // Debug: list all emails in database (first 5)
      try {
        const [allUsers] = await db.query('SELECT email FROM users LIMIT 5');
        console.log('Available emails in database:', allUsers.map(u => u.email));
      } catch (e) {
        console.error('Could not fetch user list:', e.message);
      }
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    
    // Debug logging (remove in production)
    console.log(`Login attempt for: ${email}`);
    console.log(`Password hash starts with: ${user.password.substring(0, 10)}...`);
    console.log(`Password hash length: ${user.password.length}`);
    
    // Check password - handle multiple hash formats
    let isMatch = false;
    
    if (user.password && user.password.startsWith('$2')) {
      // Bcrypt hash (standard format: $2a$, $2b$, $2y$)
      isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const trimmedDbPassword = user.password.trim();
        if (trimmedDbPassword !== user.password) {
          isMatch = await bcrypt.compare(password, trimmedDbPassword);
        }
      }
    } else if (user.password && user.password.startsWith('b0')) {
      // Passwords starting with 'b0' - likely missing '$2' prefix from bcrypt hash
      // Try adding '$2' prefix and compare
      console.log(`⚠️ Warning: Password hash starts with 'b0' for user ${email} - attempting to fix`);
      
      // Try with $2 prefix added (common bcrypt corruption)
      const fixedHash = '$2' + user.password;
      try {
        isMatch = await bcrypt.compare(password, fixedHash);
        if (isMatch) {
          console.log(`✅ Password matched with fixed hash. Updating database...`);
          // Update the password in database with correct format
          await db.query('UPDATE users SET password = ? WHERE id = ?', [fixedHash, user.id]);
          console.log(`✅ Password hash fixed in database for ${email}`);
        }
      } catch (e) {
        console.log('Bcrypt comparison failed with fixed hash');
      }
      
      // If that doesn't work, try plain text comparison
      if (!isMatch) {
        isMatch = (password === user.password || password === user.password.trim());
        
        // If password matches as plain text, hash it properly
        if (isMatch) {
          console.log(`⚠️ Password matched as plain text. Rehashing for user ${email}...`);
          try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
            console.log(`✅ Password rehashed successfully for ${email}`);
          } catch (e) {
            console.error('Failed to rehash password:', e.message);
          }
        }
      }
    } else {
      // Plain text fallback or unknown format
      isMatch = (password === user.password || password === user.password.trim());
      
      // If password matches but is plain text, hash it properly
      if (isMatch && user.password.length < 60) {
        console.log(`⚠️ Password stored as plain text for user ${email}. Hashing now...`);
        try {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
          console.log(`✅ Password hashed successfully for ${email}`);
        } catch (e) {
          console.error('Failed to hash password:', e.message);
        }
      }
    }

    if (!isMatch) {
      console.log(`Login attempt failed: Password mismatch for ${email}`);
      console.log(`Provided password length: ${password.length}`);
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

    const { name, email: rawEmail, password } = value;
    
    // Normalize email (trim and lowercase) to match login behavior
    const email = rawEmail.trim().toLowerCase();
    const normalizedPassword = password.trim();

    // Check if user already exists (case-insensitive)
    const [existing] = await db.query('SELECT id FROM users WHERE LOWER(TRIM(email)) = ?', [email]);
    
    if (existing.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(normalizedPassword, salt);

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
