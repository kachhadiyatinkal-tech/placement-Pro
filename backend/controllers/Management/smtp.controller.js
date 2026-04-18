const SmtpConfig = require('../../models/smtpConfig.model');
const { sendError, sendSuccess } = require('../../utils/apiResponse');

const getSmtpConfig = async (req, res) => {
  try {
    let config = await SmtpConfig.findOne();
    if (!config) {
      // Create default config if none exists, using env as fallback
      config = await SmtpConfig.create({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
        isEnabled: true
      });
    }
    return sendSuccess(res, 200, { data: config });
  } catch (error) {
    console.log('smtp.controller.getSmtpConfig => ', error);
    return sendError(res, 500, 'Internal Server Error');
  }
};

const updateSmtpConfig = async (req, res) => {
  try {
    const { host, port, secure, user, pass, isEnabled } = req.body;
    
    let config = await SmtpConfig.findOne();
    if (config) {
      config.host = String(host).trim();
      config.port = Number(port);
      config.secure = Boolean(secure);
      config.user = String(user).trim();
      config.pass = String(pass).trim();
      config.isEnabled = Boolean(isEnabled);
      config.updatedAt = Date.now();
      await config.save();
    } else {
      config = await SmtpConfig.create({
        host: String(host).trim(),
        port: Number(port),
        secure: Boolean(secure),
        user: String(user).trim(),
        pass: String(pass).trim(),
        isEnabled: Boolean(isEnabled)
      });
    }

    return sendSuccess(res, 200, { message: 'SMTP Configuration updated successfully', data: config });
  } catch (error) {
    console.log('smtp.controller.updateSmtpConfig => ', error);
    return sendError(res, 500, 'Internal Server Error');
  }
};

module.exports = {
  getSmtpConfig,
  updateSmtpConfig
};
