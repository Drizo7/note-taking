const express = require('express');
const { signup, login, changePassword, resetPassword, verifyResetToken } = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/reset-password/:token', verifyResetToken);
router.put('/changePassword', authMiddleware, changePassword);

//router.get('/auth/google', googleAuth);

module.exports = router;
