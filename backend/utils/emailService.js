const nodemailer = require('nodemailer');
const hbs = require('handlebars');
const fs = require('fs');
const path = require('path');
const SmtpConfig = require('../models/smtpConfig.model');

const compileTemplate = (templateName, data) => {
  const filePath = path.join(__dirname, 'email', 'templates', `${templateName}.hbs`);
  const source = fs.readFileSync(filePath, 'utf-8');
  const template = hbs.compile(source);
  return template(data);
};

const sendEmail = async (options) => {
  // Fetch config from DB
  let config = await SmtpConfig.findOne();
  
  if (!config) {
    // Fallback if not in DB yet
    config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      isEnabled: true
    };
  }

  // Check if email feature is enabled
  if (!config.isEnabled) {
    console.warn(`Email sending is DISABLED for ${options.email}. Check SMTP settings in Admin Dashboard.`);
    return;
  }

  // If a template is specified, compile it
  if (options.template) {
    try {
      options.html = compileTemplate(options.template, options.templateData || {});
      console.log(`Email template '${options.template}' compiled successfully`);
    } catch (err) {
      console.error(`Error compiling template ${options.template}:`, err);
      // Fallback to plain message if html compilation fails
    }
  }

  const transporter = nodemailer.createTransport({
    host: String(config.host).trim(),
    port: Number(config.port),
    secure: config.secure,
    auth: {
      user: String(config.user).trim(),
      pass: String(config.pass).trim()
    }
  });

  const mailOptions = {
    from: `PlacementPro <${String(config.user).trim()}>`,
    to: String(options.email).trim(),
    subject: String(options.subject).trim(),
    text: options.message,
    html: options.html
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent successfully to ${options.email}. MessageId: ${info.messageId}`);
};

module.exports = sendEmail;
