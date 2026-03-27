const express = require('express');

// router after /api/v1/user/
const router = express.Router();

// import multer for user profile update 
const uploadUserProfile = require('../config/MulterProfilePhoto.js');

const authenticateToken = require('../middleware/auth.middleware');

const UserLogin = require('../controllers/user/user.login.controller.js');

// users controller methods
const UserDetail = require('../controllers/user/user.detail.controller.js');
const AllUsersLen = require('../controllers/user/user.all-users.controller.js');
const UpdatePhoto = require('../controllers/user/user.update-photo.controller.js');
const UpdateProfile = require('../controllers/user/user.update-profile.controller.js');
const UpdatePassword = require('../controllers/user/user.update-password.js');
const UserData = require('../controllers/user/user.show-data.js');
const ForgotPassword = require('../controllers/user/forgot-password.controller.js');
const ResetPassword = require('../controllers/user/reset-password.controller.js');
const VerifyResetToken = require('../controllers/user/verify-reset-token.controller.js');

// campus login (student, tpo, management, admin / superuser)
router.post('/login', UserLogin);

// details of users student
router.get('/detail', authenticateToken, UserDetail);

// all user in length
router.get('/all-users', AllUsersLen);

router.get('/:userId', authenticateToken, UserData);

router.post('/upload-photo', uploadUserProfile.single('profileImgs'), UpdatePhoto);

router.post('/update-profile', authenticateToken, UpdateProfile);

router.post('/change-password', authenticateToken, UpdatePassword);

router.post('/forgot-password', ForgotPassword);
router.post('/verify-reset-token', VerifyResetToken);
router.post('/reset-password', ResetPassword);

module.exports = router;