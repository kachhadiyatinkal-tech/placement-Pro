const User = require("../../models/user.model");
const Company = require("../../models/company.model");
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { sendError, sendSuccess } = require("../../utils/apiResponse");

const ResetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    if (!token || !String(token).trim()) {
      return sendError(res, 400, "Validation failed", { token: "Reset token is required" });
    }
    if (!password || String(password).length < 6) {
      return sendError(res, 400, "Validation failed", {
        password: "Password must be at least 6 characters",
      });
    }

    // Hash incoming token using SHA256
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and expiry > now
    let account = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!account) {
      account = await Company.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });
    }

    if (!account) {
      return sendError(res, 400, "Invalid or expired token");
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    account.password = hashedPassword;
    
    // Remove resetPasswordToken and resetPasswordExpires
    account.resetPasswordToken = undefined;
    account.resetPasswordExpires = undefined;
    
    // Also clear old fields if they exist (only for user, but safe to set on company too)
    account.resetToken = undefined;
    account.resetTokenExpiry = undefined;

    await account.save();

    return sendSuccess(res, 200, { message: "Password reset successful" });

  } catch (error) {
    console.log("reset-password.controller.js => ", error);
    return sendError(res, 500, "Internal server error");
  }
}

module.exports = ResetPassword;