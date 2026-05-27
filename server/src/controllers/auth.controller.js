const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const data = await authService.register({ name, email, password });
    return successResponse(res, 201, 'Registration successful', data);
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await authService.login({ email, password });
    return successResponse(res, 200, 'Login successful', data);
  } catch (err) {
    return next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const data = await authService.getMe(req.user.id);
    return successResponse(res, 200, 'User profile retrieved', data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, getMe };
