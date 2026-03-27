function sendError(res, status, message, errors = {}) {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
}

function sendSuccess(res, status, payload = {}) {
  return res.status(status).json({
    success: true,
    ...payload,
  });
}

module.exports = {
  sendError,
  sendSuccess,
};
