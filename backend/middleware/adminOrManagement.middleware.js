/**
 * After authenticateToken: only campus admin roles may change chatbot settings.
 */
function requireAdminOrManagement(req, res, next) {
  const role = req.user?.role;
  if (role === 'admin' || role === 'superuser' || role === 'management') {
    return next();
  }
  return res.status(403).json({ msg: 'Only administrators can update chatbot settings.' });
}

module.exports = requireAdminOrManagement;
