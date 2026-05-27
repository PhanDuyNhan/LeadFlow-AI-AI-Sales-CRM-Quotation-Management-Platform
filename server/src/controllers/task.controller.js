const taskService = require('../services/task.service');
const { successResponse } = require('../utils/response');

async function listTasks(req, res, next) {
  try {
    const data = await taskService.listTasks(req.user, req.query);
    return successResponse(res, 200, 'Tasks retrieved', data);
  } catch (err) {
    return next(err);
  }
}

async function todayFollowUps(req, res, next) {
  try {
    const data = await taskService.getTodayFollowUps(req.user);
    return successResponse(res, 200, "Today's follow-ups", data);
  } catch (err) {
    return next(err);
  }
}

async function overdueFollowUps(req, res, next) {
  try {
    const data = await taskService.getOverdueFollowUps(req.user);
    return successResponse(res, 200, 'Overdue follow-ups', data);
  } catch (err) {
    return next(err);
  }
}

async function getTask(req, res, next) {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user);
    return successResponse(res, 200, 'Task retrieved', task);
  } catch (err) {
    return next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const task = await taskService.createTask(req.body, req.user);
    return successResponse(res, 201, 'Task created', task);
  } catch (err) {
    return next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user);
    return successResponse(res, 200, 'Task updated', task);
  } catch (err) {
    return next(err);
  }
}

async function completeTask(req, res, next) {
  try {
    const task = await taskService.completeTask(req.params.id, req.user);
    return successResponse(res, 200, 'Task marked as completed', task);
  } catch (err) {
    return next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const result = await taskService.deleteTask(req.params.id, req.user);
    return successResponse(res, 200, 'Task deleted', result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listTasks,
  todayFollowUps,
  overdueFollowUps,
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
};
