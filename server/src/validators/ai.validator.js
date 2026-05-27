const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');
const { FOLLOW_UP_PURPOSES } = require('../services/aiService');

const followUpMessageRules = [
  body('followUpPurpose')
    .exists({ checkFalsy: true }).withMessage('followUpPurpose is required').bail()
    .isIn(FOLLOW_UP_PURPOSES).withMessage(`followUpPurpose must be one of: ${FOLLOW_UP_PURPOSES.join(', ')}`),
  body('customerName').optional({ nullable: true }).isString().withMessage('customerName must be a string'),
  body('leadStatus').optional({ nullable: true }).isString().withMessage('leadStatus must be a string'),
  body('needDescription').optional({ nullable: true }).isString().withMessage('needDescription must be a string'),
  body('budget').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('budget must be a non-negative number'),
  body('lastNote').optional({ nullable: true }).isString().withMessage('lastNote must be a string'),
  body('quotationStatus').optional({ nullable: true }).isString().withMessage('quotationStatus must be a string'),
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

module.exports = { followUpMessageRules, handleValidation };
