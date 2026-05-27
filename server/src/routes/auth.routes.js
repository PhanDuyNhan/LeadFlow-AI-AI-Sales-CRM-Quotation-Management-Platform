const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  registerRules,
  loginRules,
  handleValidation,
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', registerRules, handleValidation, authController.register);
router.post('/login', loginRules, handleValidation, authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
