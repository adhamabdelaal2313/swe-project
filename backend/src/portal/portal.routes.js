const express = require('express');
const router = express.Router();
const { login, register, getCurrentUser, logout, refreshSession } = require('./portal.controller');
const { auth } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.get('/user', auth, getCurrentUser);
router.get('/refresh', auth, refreshSession);
router.post('/logout', auth, logout);

module.exports = router;
