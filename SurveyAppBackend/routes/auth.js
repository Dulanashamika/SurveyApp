const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register user
router.post('/registering', authController.register);

// Login user
router.post('/login', authController.login);

// Google register/login
router.post('/google-register', authController.googleRegister);

// Send confirmation email
router.post('/send-confirmation-email', authController.sendConfirmationEmail);

// Send password reset email
router.post('/send-password-reset-email', authController.sendPasswordResetEmail);

// Verify password reset code
router.post('/verify-reset-code', authController.verifyResetCode);

// Send email verification
router.post('/send-email', authController.sendEmail);

// Email validation (confirm email)
router.post('/email-validation', authController.emailValidation);

// Save PIN
router.post('/save-pin', authController.savePin);

// Get user profile
router.get('/profile', authController.getProfile);

// Delete account request
router.post('/delete-account', authController.deleteAccount);

// Add/update user area
router.post('/add-area', authController.addArea);

// Update profile (POST)
router.post('/profile', authController.updateProfile);

// Get team members
router.get('/getTeamMembers', authController.getTeamMembers);

// Save or update team data
router.post('/saveOrUpdateTeamData', authController.saveOrUpdateTeamData);

// Get user validation (admin approval check)
router.get('/get-user-validation', authController.getUserValidation);

// Approve user (admin action)
router.post('/approve-user', authController.approveUser);

// Update password
router.post('/update-password', authController.updatePassword);

// Add username
router.post('/add-username', authController.addUsername);

// Get research area
router.post('/get-reArea', authController.getResearchArea);

// Get name data
router.post('/get-name', authController.getNameData);

// Save signup details (survey types, research areas, etc.)
router.post('/save-signup-details', authController.saveSignupDetails);

// Get pending users for admin
router.get('/pending-users', authController.getPendingUsers);

module.exports = router;
