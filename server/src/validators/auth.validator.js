const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const registerRules = [
  body('name')
    .exists({ checkFalsy: true }).withMessage('Name is required').bail()
    .isString().withMessage('Name must be a string').bail()
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .exists({ checkFalsy: true }).withMessage('Email is required').bail()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .exists({ checkFalsy: true }).withMessage('Password is required').bail()
    .isString().withMessage('Password must be a string').bail()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  body('email')
    .exists({ checkFalsy: true }).withMessage('Email is required').bail()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .exists({ checkFalsy: true }).withMessage('Password is required'),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((e) => ({
    field: e.path || e.param,
    message: e.msg,
  }));
  return errorResponse(res, 400, 'Validation failed', formatted);
}

module.exports = {
  registerRules,
  loginRules,
  handleValidation,
};
