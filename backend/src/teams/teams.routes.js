const express = require('express');
const router = express.Router();
const {
  getAllTeams,
  createTeam,
  deleteTeam
} = require('./teams.controller');

// Route definitions - map URLs to controller functions
router.get('/', getAllTeams);
router.post('/', createTeam);
router.delete('/:id', deleteTeam);

module.exports = router;

