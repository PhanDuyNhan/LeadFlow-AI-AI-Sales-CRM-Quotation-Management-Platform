const { errorResponse } = require('../utils/response');

function notFoundHandler(req, res) {
  return errorResponse(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error('[error]', statusCode, message);
  }

  return errorResponse(res, statusCode, message, err.errors);
}

module.exports = { notFoundHandler, errorHandler };
