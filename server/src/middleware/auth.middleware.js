const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return errorResponse(res, 401, 'Unauthorized — no valid token', []);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);
    if (!user) {
      return errorResponse(res, 401, 'Unauthorized — user no longer exists', []);
    }
    req.user = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
    return next();
  } catch (err) {
    return errorResponse(res, 401, 'Unauthorized — invalid or expired token', []);
  }
}

module.exports = { protect };
