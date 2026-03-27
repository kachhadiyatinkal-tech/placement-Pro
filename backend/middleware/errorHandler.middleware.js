const { sendError } = require("../utils/apiResponse");

function normalizeMongooseValidation(err) {
  if (!err?.errors) return {};
  const errors = {};
  Object.keys(err.errors).forEach((key) => {
    errors[key] = err.errors[key]?.message || "Invalid value";
  });
  return errors;
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err?.name === "ValidationError") {
    return sendError(res, 400, "Validation failed", normalizeMongooseValidation(err));
  }

  if (err?.code === 11000) {
    const key = Object.keys(err.keyPattern || {})[0] || "field";
    return sendError(res, 409, "Duplicate value", {
      [key]: `${key} already exists`,
    });
  }

  if (err?.name === "UnauthorizedError" || err?.status === 401) {
    return sendError(res, 401, err.message || "Unauthorized", {
      auth: err.message || "Unauthorized access",
    });
  }

  const status = err?.statusCode || err?.status || 500;
  const message = err?.message || "Internal server error";
  const errors = err?.errors && typeof err.errors === "object" ? err.errors : {};
  return sendError(res, status, status === 500 ? "Internal server error" : message, errors);
}

module.exports = errorHandler;
