const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { errorResponse } = require('../utils/response');
const { TASK_PRIORITIES, TASK_STATUSES } = require('../models/Task');

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const createTaskRules = [
  body('title')
    .exists({ checkFalsy: true }).withMessage('Title is required').bail()
    .isString().withMessage('Title must be a string').bail()
    .trim()
    .isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional({ nullable: true }).isString().withMessage('Description must be a string'),
  body('dueDate')
    .exists({ checkFalsy: true }).withMessage('Due date is required').bail()
    .isISO8601().withMessage('dueDate must be a valid ISO date'),
  body('priority').optional({ nullable: true, checkFalsy: true })
    .isIn(TASK_PRIORITIES).withMessage(`priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
  body('status').optional({ nullable: true, checkFalsy: true })
    .isIn(TASK_STATUSES).withMessage(`status must be one of: ${TASK_STATUSES.join(', ')}`),
  body('lead').optional({ nullable: true, checkFalsy: true })
    .custom(isObjectId).withMessage('lead must be a valid lead id'),
  body('assignedTo').optional({ nullable: true, checkFalsy: true })
    .custom(isObjectId).withMessage('assignedTo must be a valid user id'),
];

const updateTaskRules = [
  param('id').custom(isObjectId).withMessage('Invalid task id'),
  body('title').optional({ checkFalsy: true })
    .isString().withMessage('Title must be a string').bail()
    .trim()
    .isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('description').optional({ nullable: true }).isString().withMessage('Description must be a string'),
  body('dueDate').optional({ checkFalsy: true }).isISO8601().withMessage('dueDate must be a valid ISO date'),
  body('priority').optional({ nullable: true, checkFalsy: true })
    .isIn(TASK_PRIORITIES).withMessage(`priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
  body('status').optional({ nullable: true, checkFalsy: true })
    .isIn(TASK_STATUSES).withMessage(`status must be one of: ${TASK_STATUSES.join(', ')}`),
  body('lead').optional({ nullable: true, checkFalsy: true })
    .custom(isObjectId).withMessage('lead must be a valid lead id'),
  body('assignedTo').optional({ nullable: true, checkFalsy: true })
    .custom(isObjectId).withMessage('assignedTo must be a valid user id'),
];

const idParamRules = [param('id').custom(isObjectId).withMessage('Invalid task id')];

const listQueryRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('filter').optional({ checkFalsy: true })
    .isIn(['today', 'overdue', 'pending', 'completed', 'all']).withMessage('filter must be one of: today, overdue, pending, completed, all'),
  query('status').optional({ checkFalsy: true })
    .isIn(TASK_STATUSES).withMessage(`status must be one of: ${TASK_STATUSES.join(', ')}`),
  query('priority').optional({ checkFalsy: true })
    .isIn(TASK_PRIORITIES).withMessage(`priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
  query('lead').optional({ checkFalsy: true })
    .custom(isObjectId).withMessage('lead must be a valid lead id'),
  query('assignedTo').optional({ checkFalsy: true })
    .custom(isObjectId).withMessage('assignedTo must be a valid user id'),
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
  createTaskRules,
  updateTaskRules,
  idParamRules,
  listQueryRules,
  handleValidation,
};
