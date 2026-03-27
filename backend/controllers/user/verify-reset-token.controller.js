const User = require("../../models/user.model");
const jwt = require('jsonwebtoken');
const { sendError, sendSuccess } = require("../../utils/apiResponse");

const VerifyResetToken = async (req, res) => {
  const { token } = req.body;

  try {
    if (!token || !String(token).trim()) {
      return sendError(res, 400, "Validation failed", { token: "Reset token is required" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists and token hasn't expired
    const user = await User.findOne({
      _id: decoded.userId,
      email: decoded.email,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return sendError(res, 400, "Validation failed", { token: "Invalid or expired reset token" });
    }

    return sendSuccess(res, 200, { message: "Token is valid" });

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, 400, "Validation failed", { token: "Reset token has expired" });
    }
    console.log("verify-reset-token.controller.js => ", error);
    return sendError(res, 400, "Validation failed", { token: "Invalid reset token" });
  }
}

module.exports = VerifyResetToken;