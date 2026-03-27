const jwt = require('jsonwebtoken');
const StudentUser = require('../models/user.model');
const Company = require('../models/company.model');
const { sendError } = require('../utils/apiResponse');

const authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return sendError(res, 401, 'Unauthorized', { auth: 'Login required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'company') {
      const company = await Company.findOne({ _id: decoded.userId, token });
      if (!company) return sendError(res, 401, 'Unauthorized', { auth: 'Token is not valid. Please login.' });
      req.user = company;
      req.user.role = 'company';
    } else {
      const user = await StudentUser.findOne({ _id: decoded.userId, token });
      if (!user) return sendError(res, 401, 'Unauthorized', { auth: 'Token is not valid. Please login.' });
      req.user = user;
    }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, 401, 'Unauthorized', { auth: 'Session expired. Please login again.' });
    } else {
      console.log("auth.middleware.js => ", error);
      return sendError(res, 401, 'Unauthorized', { auth: 'Please login first' });
    }
  }
}

module.exports = authenticateToken;
