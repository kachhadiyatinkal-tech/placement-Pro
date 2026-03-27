const User = require("../../models/user.model");
const jwt = require('jsonwebtoken');
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

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists and token is valid
    const user = await User.findOne({
      _id: decoded.userId,
      email: decoded.email,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return sendError(res, 400, "Validation failed", { token: "Invalid or expired reset token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return sendSuccess(res, 200, { message: "Password reset successfully" });

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, 400, "Validation failed", { token: "Reset token has expired" });
    }
    console.log("reset-password.controller.js => ", error);
    return sendError(res, 500, "Internal server error");
  }
}

module.exports = ResetPassword;