require('dotenv').config();
const mongoose = require('mongoose');
const sendEmail = require('../utils/emailService');

const test = async () => {
  try {
    console.log('--- Email Diagnostic Test ---');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/placement');
    
    const recipient = process.env.EMAIL_USER; // Send to self
    console.log(`Attempting to send a test email to: ${recipient}`);
    
    await sendEmail({
      email: recipient,
      subject: 'PlacementPro Diagnostic Test',
      message: 'If you see this, your SMTP settings are working correctly!'
    });
    
    console.log('SUCCESS: Email sent successfully!');
    process.exit(0);
  } catch (error) {
    console.error('FAILURE: Error sending email.');
    console.error('Details:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Authentication Failed: Check your EMAIL_USER and EMAIL_PASS (App Password).');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('Connection Failed: Check your SMTP_HOST and SMTP_PORT.');
    }
    process.exit(1);
  }
};

test();
