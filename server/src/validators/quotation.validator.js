const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { errorResponse } = require('../utils/response');
const { QUOTATION_STATUSES } = require('../models/Quotation');
const { LEAD_STATUSES } = require('../models/Lead');

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const itemRules = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.name')
    .exists({ checkFalsy: true }).withMessage('Item name is required').bail()
    .isString().withMessage('Item name must be a string'),
  body('items.*.description').optional({ nullable: true }).isString().withMessage('Item description must be a string'),
  body('items.*.quantity')
    .exists({ checkFalsy: false }).withMessage('Quantity is required').bail()
    .isFloat({ min: 0 }).withMessage('Quantity must be a non-negative number'),
  body('items.*.unitPrice')
    .exists({ checkFalsy: false }).withMessage('Unit price is required').bail()
    .isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
];

const createRules = [
  body('lead')
    .exists({ checkFalsy: true }).withMessage('lead is required').bail()
    .custom(isObjectId).withMessage('lead must be a valid id'),
  body('quotationCode').optional({ nullable: true }).isString().withMessage('quotationCode must be a string'),
  body('customerName').optional({ nullable: true }).isString().withMessage('customerName must be a string'),
  body('discount').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Discount cannot be negative'),
  body('tax').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Tax cannot be negative'),
  body('status').optional({ nullable: true, checkFalsy: true }).isIn(QUOTATION_STATUSES).withMessage(`status must be one of: ${QUOTATION_STATUSES.join(', ')}`),
  body('validUntil').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('validUntil must be a valid date'),
  body('notes').optional({ nullable: true }).isString().withMessage('notes must be a string'),
  ...itemRules,
];

const updateRules = [
  param('id').custom(isObjectId).withMessage('Invalid quotation id'),
  body('quotationCode').optional({ nullable: true }).isString(),
  body('customerName').optional({ nullable: true }).isString(),
  body('lead').optional({ checkFalsy: true }).custom(isObjectId).withMessage('lead must be a valid id'),
  body('discount').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Discount cannot be negative'),
  body('tax').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Tax cannot be negative'),
  body('status').optional({ nullable: true, checkFalsy: true }).isIn(QUOTATION_STATUSES).withMessage(`status must be one of: ${QUOTATION_STATUSES.join(', ')}`),
  body('validUntil').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('validUntil must be a valid date'),
  body('notes').optional({ nullable: true }).isString(),
  body('items').optional().isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  body('items.*.name').optional({ checkFalsy: true }).isString().withMessage('Item name must be a string'),
  body('items.*.description').optional({ nullable: true }).isString(),
  body('items.*.quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be a non-negative number'),
  body('items.*.unitPrice').optional().isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
];

const statusRules = [
  param('id').custom(isObjectId).withMessage('Invalid quotation id'),
  body('status')
    .exists({ checkFalsy: true }).withMessage('status is required').bail()
    .isIn(QUOTATION_STATUSES).withMessage(`status must be one of: ${QUOTATION_STATUSES.join(', ')}`),
  body('leadStatus').optional({ nullable: true, checkFalsy: true }).isIn(LEAD_STATUSES).withMessage(`leadStatus must be one of: ${LEAD_STATUSES.join(', ')}`),
];

const listQueryRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('status').optional({ checkFalsy: true }).isIn(QUOTATION_STATUSES).withMessage(`status must be one of: ${QUOTATION_STATUSES.join(', ')}`),
  query('lead').optional({ checkFalsy: true }).custom(isObjectId).withMessage('lead must be a valid id'),
  query('sortOrder').optional({ checkFalsy: true }).isIn(['asc', 'desc']),
];

const idParamRules = [param('id').custom(isObjectId).withMessage('Invalid quotation id')];

const leadIdParamRules = [param('leadId').custom(isObjectId).withMessage('Invalid lead id')];

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
  createRules,
  updateRules,
  statusRules,
  listQueryRules,
  idParamRules,
  leadIdParamRules,
  handleValidation,
};
