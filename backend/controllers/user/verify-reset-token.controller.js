const User = require("../../models/user.model");
const Company = require("../../models/company.model");
const crypto = require('crypto');
const { sendError, sendSuccess } = require("../../utils/apiResponse");

const VerifyResetToken = async (req, res) => {
  const { token } = req.body;

  try {
    if (!token || !String(token).trim()) {
      return sendError(res, 400, "Validation failed", { token: "Reset token is required" });
    }

    // Hash incoming token using SHA256
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Check if user exists and token hasn't expired
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

    return sendSuccess(res, 200, { message: "Token is valid" });

  } catch (error) {
    console.log("verify-reset-token.controller.js => ", error);
    return sendError(res, 500, "Internal server error");
  }
}

module.exports = VerifyResetToken;