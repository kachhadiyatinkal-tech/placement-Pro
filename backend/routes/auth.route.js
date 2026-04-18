const express = require('express');
const router = express.Router();
const ForgotPassword = require('../controllers/user/forgot-password.controller');
const ResetPassword = require('../controllers/user/reset-password.controller');
const VerifyResetToken = require('../controllers/user/verify-reset-token.controller');

router.post('/forgot-password', ForgotPassword);
router.post('/reset-password', ResetPassword);
router.post('/verify-reset-token', VerifyResetToken);

module.exports = router;
