const User = require("../../models/user.model");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { sendError, sendSuccess } = require("../../utils/apiResponse");

const ForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || !String(email).trim()) {
      return sendError(res, 400, "Validation failed", { email: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return sendSuccess(res, 200, { message: "If an account with that email exists, a password reset link has been sent." });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save reset token to user (in a real app, you'd want to store this securely)
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // For development/testing: Log the reset URL instead of sending email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password?token=${resetToken}`;
    console.log('Password reset URL (for development):', resetUrl);

    // Create email transporter (in production, use a real email service)
    // For now, we'll skip actual email sending and just return success
    // Uncomment the code below when you have email credentials configured

    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - College Placement Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your College Placement Management System account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">College Placement Management System</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.log("Email sending failed:", emailError);
    }
    */

    return sendSuccess(res, 200, { message: "If an account with that email exists, a password reset link has been sent." });

  } catch (error) {
    console.log("forgot-password.controller.js => ", error);
    return sendError(res, 500, "Internal server error");
  }
}

module.exports = ForgotPassword;