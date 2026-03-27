/**
 * After authenticateToken: admin, management, superuser, or TPO may update shared campus content.
 */
function requireAdminManagementOrTpo(req, res, next) {
  const role = req.user?.role;
  if (role === 'admin' || role === 'superuser' || role === 'management' || role === 'tpo') {
    return next();
  }
  return res.status(403).json({ msg: 'Only administrators or TPO can update this content.' });
}

module.exports = requireAdminManagementOrTpo;
