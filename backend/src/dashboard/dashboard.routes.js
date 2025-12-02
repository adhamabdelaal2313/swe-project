// backend/src/dashboard/dashboard.routes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller'); 

// --- GET Routes ---
// These routes fetch data for the dashboard UI elements.
// URL: GET /api/dashboard/stats
router.get('/stats', dashboardController.getDashboardStats);

// URL: GET /api/dashboard/activity
router.get('/activity', dashboardController.getRecentActivity);

// --- POST Routes ---
// These routes handle submissions from the QuickActions modals.
// URL: POST /api/dashboard/task
router.post('/task', dashboardController.createQuickTask);

// URL: POST /api/dashboard/team
router.post('/team', dashboardController.createTeam);

module.exports = router;