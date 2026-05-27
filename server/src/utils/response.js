function successResponse(res, statusCode, message, data) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
}

function errorResponse(res, statusCode, message, errors) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors ?? null,
  });
}

module.exports = { successResponse, errorResponse };
