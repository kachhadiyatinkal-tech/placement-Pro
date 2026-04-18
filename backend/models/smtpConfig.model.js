const mongoose = require('mongoose');

const SmtpConfigSchema = new mongoose.Schema({
  host: { type: String, required: true, default: 'smtp.gmail.com' },
  port: { type: Number, required: true, default: 587 },
  secure: { type: Boolean, default: false },
  user: { type: String, required: true },
  pass: { type: String, required: true },
  isEnabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SmtpConfig', SmtpConfigSchema);
