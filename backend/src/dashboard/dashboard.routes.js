// backend/src/dashboard/dashboard.routes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller'); 
const { auth } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(auth);

// --- GET Routes ---
router.get('/stats', dashboardController.getDashboardStats);
router.get('/activity', dashboardController.getRecentActivity);

// --- POST Routes ---
router.post('/task', dashboardController.createQuickTask);

module.exports = router;
