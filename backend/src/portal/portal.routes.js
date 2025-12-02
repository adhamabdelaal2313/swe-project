const express = require('express');
const router = express.Router();
const { login, register, getCurrentUser, logout } = require('./portal.controller');

router.post('/login', login);
router.post('/register', register);
router.get('/user', getCurrentUser);
router.post('/logout', logout);

module.exports = router;

