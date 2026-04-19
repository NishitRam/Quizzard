const express = require('express');
const { register, login, updatePassword, forgotPassword, resetPassword, socialLogin, checkEmail, updateProfile, updateAvatar, getMe } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.put('/update-profile', protect, updateProfile);
router.put('/update-avatar', protect, updateAvatar);
router.post('/check-email', checkEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/social-login', socialLogin);

module.exports = router;
