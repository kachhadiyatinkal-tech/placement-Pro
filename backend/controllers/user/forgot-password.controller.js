const User = require("../../models/user.model");
const Company = require("../../models/company.model");
const crypto = require('crypto');
const { sendError, sendSuccess } = require("../../utils/apiResponse");

const ForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || !String(email).trim()) {
      return sendError(res, 400, "Validation failed", { email: "Email is required" });
    }

    let account = await User.findOne({ email: email.toLowerCase() });
    
    if (!account) {
      account = await Company.findOne({ email: email.toLowerCase() });
    }
    
    // Always return success message for security (don't reveal if email exists)
    const successResponse = { message: "If an account exists, a reset link has been sent." };

    if (!account) {
      return sendSuccess(res, 200, successResponse);
    }

    // Generate secure token using crypto.randomBytes(32)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token using SHA256 before saving
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save hashed token and expiry (15 minutes) in DB
    account.resetPasswordToken = hashedToken;
    account.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await account.save();

    console.log(`Password reset token generated and saved for account: ${account.email}`);

    // Create reset URL: FRONTEND_URL/reset-password?token=rawToken
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const { enqueueEmail } = require('../../services/email.queue');

    // Send email using the queue (with fallback)
    enqueueEmail({
      email: account.email,
      subject: 'PlacementPro Elite - Password Reset Request',
      template: 'forgotPassword',
      templateData: {
        resetUrl: resetUrl
      },
      message: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
               `Please click on the following link to complete the process: ${resetUrl}\n\n` +
               `If you did not request this, please ignore this email and your password will remain unchanged.\n`
    }).catch(err => console.error("Critical: Forgot password email dispatch failed:", err));

    return sendSuccess(res, 200, successResponse);

  } catch (error) {
    console.log("forgot-password.controller.js => ", error);
    return sendError(res, 500, "Internal server error");
  }
}

module.exports = ForgotPassword;