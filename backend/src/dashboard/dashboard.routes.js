const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivity, createQuickTask } = require('./dashboard.controller');

router.get("/stats", getDashboardStats);
router.get("/activity", getRecentActivity);
router.post("/task", createQuickTask);

module.exports = router;