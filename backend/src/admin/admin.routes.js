const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateUser,
  resetUserPassword,
  deleteUser,
  getUserStats
} = require('./admin.controller');

// Admin middleware - check if user is admin
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// All admin routes require authentication and admin role
router.use(auth);
router.use(adminOnly);

// Routes
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.put('/users/:id/reset-password', resetUserPassword);
router.delete('/users/:id', deleteUser);

module.exports = router;

