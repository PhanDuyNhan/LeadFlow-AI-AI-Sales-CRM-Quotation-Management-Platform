const { errorResponse } = require('../utils/response');

function requireRole(...allowed) {
  return function roleGate(req, res, next) {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized', []);
    }
    if (!allowed.includes(req.user.role)) {
      return errorResponse(res, 403, 'Forbidden — insufficient role', []);
    }
    return next();
  };
}

const requireAdmin = requireRole('admin');

module.exports = { requireRole, requireAdmin };
