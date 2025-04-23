const express = require('express');
const router = express.Router();
const authController = require('../Controllers/AuthController');
const ensureAuthenticated = require('../Middlewares/Auth');
const authValidation = require('../Middlewares/AuthValidation');

router.post('/signup', authValidation.validateSignup, authController.signup);
router.post('/login', authValidation.validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/profile', ensureAuthenticated, authController.getProfile);

module.exports = router;