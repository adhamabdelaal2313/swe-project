const express = require('express');
const router = express.Router();
const {
  getAllTeams,
  createTeam,
  addMember,
  removeMember,
  deleteTeam
} = require('./teams.controller');
const { auth } = require('../middleware/auth');

// All team routes require authentication
router.use(auth);

router.get('/', getAllTeams);
router.post('/', createTeam);
router.post('/:teamId/members', addMember);
router.delete('/:teamId/members/:userId', removeMember);
router.delete('/:id', deleteTeam);

module.exports = router;
