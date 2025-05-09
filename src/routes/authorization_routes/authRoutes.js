const express = require('express');
const router = express.Router();
const { registerUser, registerEmployee, login, logout, checkAuth } = require('../../controllers/authorization_controllers/authController');

router.post('/register/user', registerUser);
router.post('/register/employee', registerEmployee);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check-auth', checkAuth);

module.exports = router;