const jwt = require('jsonwebtoken');
const StudentUser = require('../models/user.model');
const Company = require('../models/company.model');

const optionalAuthToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'company') {
      const company = await Company.findOne({ _id: decoded.userId, token });
      if (company) {
        req.user = company;
        req.user.role = 'company';
      }
    } else {
      const user = await StudentUser.findOne({ _id: decoded.userId, token });
      if (user) {
        req.user = user;
        req.user.role = 'student';
      }
    }
  } catch (error) {
    // Token valid but maybe expired, ignore for chatbot optional auth
  }
  next();
};

module.exports = optionalAuthToken;
