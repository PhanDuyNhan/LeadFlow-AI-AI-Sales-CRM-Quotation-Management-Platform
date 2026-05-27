const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { errorResponse } = require('../utils/response');
const { LEAD_STATUSES, LEAD_SOURCES, LEAD_SCORES } = require('../models/Lead');

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const createLeadRules = [
  body('customerName')
    .exists({ checkFalsy: true }).withMessage('Customer name is required').bail()
    .isString().withMessage('Customer name must be a string').bail()
    .trim()
    .isLength({ min: 1 }).withMessage('Customer name is required'),
  body('phone')
    .exists({ checkFalsy: true }).withMessage('Phone is required').bail()
    .isString().withMessage('Phone must be a string').bail()
    .trim()
    .isLength({ min: 1 }).withMessage('Phone is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email format').bail().normalizeEmail(),
  body('company').optional({ nullable: true }).isString().withMessage('Company must be a string'),
  body('source').optional({ nullable: true, checkFalsy: true }).isIn(LEAD_SOURCES).withMessage(`Source must be one of: ${LEAD_SOURCES.join(', ')}`),
  body('needDescription').optional({ nullable: true }).isString().withMessage('Need description must be a string'),
  body('budget').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Budget must be a non-negative number'),
  body('timeline').optional({ nullable: true }).isString().withMessage('Timeline must be a string'),
  body('leadScore').optional({ nullable: true, checkFalsy: true }).isIn(LEAD_SCORES).withMessage(`Lead score must be one of: ${LEAD_SCORES.join(', ')}`),
  body('scoreReason').optional({ nullable: true }).isString().withMessage('Score reason must be a string'),
  body('suggestedAction').optional({ nullable: true }).isString().withMessage('Suggested action must be a string'),
  body('assignedTo').optional({ nullable: true, checkFalsy: true }).custom(isObjectId).withMessage('assignedTo must be a valid user id'),
  body('nextFollowUpDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('nextFollowUpDate must be a valid ISO date'),
  body('status').optional({ nullable: true }).isIn(LEAD_STATUSES).withMessage(`Status must be one of: ${LEAD_STATUSES.join(', ')}`),
];

const updateLeadRules = [
  param('id').custom(isObjectId).withMessage('Invalid lead id'),
  body('customerName').optional({ checkFalsy: true }).isString().withMessage('Customer name must be a string').bail().trim().isLength({ min: 1 }).withMessage('Customer name cannot be empty'),
  body('phone').optional({ checkFalsy: true }).isString().withMessage('Phone must be a string').bail().trim().isLength({ min: 1 }).withMessage('Phone cannot be empty'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email format').bail().normalizeEmail(),
  body('company').optional({ nullable: true }).isString().withMessage('Company must be a string'),
  body('source').optional({ nullable: true, checkFalsy: true }).isIn(LEAD_SOURCES).withMessage(`Source must be one of: ${LEAD_SOURCES.join(', ')}`),
  body('needDescription').optional({ nullable: true }).isString().withMessage('Need description must be a string'),
  body('budget').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Budget must be a non-negative number'),
  body('timeline').optional({ nullable: true }).isString().withMessage('Timeline must be a string'),
  body('status').optional({ nullable: true, checkFalsy: true }).isIn(LEAD_STATUSES).withMessage(`Status must be one of: ${LEAD_STATUSES.join(', ')}`),
  body('leadScore').optional({ nullable: true, checkFalsy: true }).isIn(LEAD_SCORES).withMessage(`Lead score must be one of: ${LEAD_SCORES.join(', ')}`),
  body('scoreReason').optional({ nullable: true }).isString().withMessage('Score reason must be a string'),
  body('suggestedAction').optional({ nullable: true }).isString().withMessage('Suggested action must be a string'),
  body('assignedTo').optional({ nullable: true, checkFalsy: true }).custom(isObjectId).withMessage('assignedTo must be a valid user id'),
  body('nextFollowUpDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('nextFollowUpDate must be a valid ISO date'),
];

const statusRules = [
  param('id').custom(isObjectId).withMessage('Invalid lead id'),
  body('status')
    .exists({ checkFalsy: true }).withMessage('Status is required').bail()
    .isIn(LEAD_STATUSES).withMessage(`Status must be one of: ${LEAD_STATUSES.join(', ')}`),
];

const noteRules = [
  param('id').custom(isObjectId).withMessage('Invalid lead id'),
  body('body')
    .exists({ checkFalsy: true }).withMessage('Note body is required').bail()
    .isString().withMessage('Note body must be a string').bail()
    .trim()
    .isLength({ min: 1 }).withMessage('Note body cannot be empty'),
];

const idParamRules = [param('id').custom(isObjectId).withMessage('Invalid lead id')];

const listQueryRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('status').optional({ checkFalsy: true }).isIn(LEAD_STATUSES).withMessage(`status must be one of: ${LEAD_STATUSES.join(', ')}`),
  query('source').optional({ checkFalsy: true }).isIn(LEAD_SOURCES).withMessage(`source must be one of: ${LEAD_SOURCES.join(', ')}`),
  query('leadScore').optional({ checkFalsy: true }).isIn(LEAD_SCORES).withMessage(`leadScore must be one of: ${LEAD_SCORES.join(', ')}`),
  query('assignedTo').optional({ checkFalsy: true }).custom(isObjectId).withMessage('assignedTo must be a valid user id'),
  query('dateFrom').optional({ checkFalsy: true }).isISO8601().withMessage('dateFrom must be a valid ISO date'),
  query('dateTo').optional({ checkFalsy: true }).isISO8601().withMessage('dateTo must be a valid ISO date'),
  query('sortOrder').optional({ checkFalsy: true }).isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
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
  createLeadRules,
  updateLeadRules,
  statusRules,
  noteRules,
  idParamRules,
  listQueryRules,
  handleValidation,
};
