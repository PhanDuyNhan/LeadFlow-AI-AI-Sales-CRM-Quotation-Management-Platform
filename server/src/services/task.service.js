const Task = require('../models/Task');
const Lead = require('../models/Lead');
const { parsePagination, buildMeta } = require('../utils/pagination');

const POPULATE_FIELDS = [
  { path: 'lead', select: 'customerName phone status nextFollowUpDate' },
  { path: 'createdBy', select: 'name email role' },
  { path: 'assignedTo', select: 'name email role' },
];

function notFound() {
  const err = new Error('Task not found');
  err.statusCode = 404;
  err.errors = [];
  return err;
}

function forbidden(message = 'You do not have permission to perform this action') {
  const err = new Error(message);
  err.statusCode = 403;
  err.errors = [];
  return err;
}

function scopeQuery(user) {
  if (user.role === 'admin') return {};
  return { $or: [{ createdBy: user.id }, { assignedTo: user.id }] };
}

function leadScopeQuery(user) {
  if (user.role === 'admin') return {};
  return { $or: [{ createdBy: user.id }, { assignedTo: user.id }] };
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function userCanAccess(task, user) {
  if (user.role === 'admin') return true;
  const createdBy = task.createdBy?._id?.toString() || task.createdBy?.toString();
  const assignedTo = task.assignedTo?._id?.toString() || task.assignedTo?.toString();
  return createdBy === user.id || assignedTo === user.id;
}

function userCanDelete(task, user) {
  if (user.role === 'admin') return true;
  const createdBy = task.createdBy?._id?.toString() || task.createdBy?.toString();
  return createdBy === user.id;
}

// Auto-update overdue status before saving / returning data.
function applyOverdueStatus(task) {
  if (!task || task.status === 'Completed') return task;
  if (task.dueDate && new Date(task.dueDate) < startOfToday() && task.status !== 'Overdue') {
    task.status = 'Overdue';
  }
  return task;
}

// Bulk version for plain (lean) objects.
function applyOverdueToList(items) {
  const today = startOfToday();
  return items.map((t) => {
    if (t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < today) {
      return { ...t, status: 'Overdue' };
    }
    return t;
  });
}

// Sweep DB-side so subsequent counts/queries are consistent.
async function sweepOverdue(user) {
  const filter = {
    ...scopeQuery(user),
    status: { $ne: 'Completed' },
    dueDate: { $lt: startOfToday() },
  };
  await Task.updateMany(filter, { $set: { status: 'Overdue' } });
}

async function listTasks(user, queryParams = {}) {
  await sweepOverdue(user);

  const { page, limit, skip } = parsePagination(queryParams);
  const filters = { ...scopeQuery(user) };
  const andFilters = [];

  const filter = queryParams.filter;
  const today = startOfToday();
  const todayEnd = endOfToday();

  if (filter === 'today') {
    andFilters.push({
      dueDate: { $gte: today, $lte: todayEnd },
      status: { $ne: 'Completed' },
    });
  } else if (filter === 'overdue') {
    andFilters.push({
      dueDate: { $lt: today },
      status: { $ne: 'Completed' },
    });
  } else if (filter === 'pending') {
    filters.status = 'Pending';
  } else if (filter === 'completed') {
    filters.status = 'Completed';
  }

  if (queryParams.status) filters.status = queryParams.status;
  if (queryParams.priority) filters.priority = queryParams.priority;
  if (queryParams.lead) filters.lead = queryParams.lead;
  if (queryParams.assignedTo) filters.assignedTo = queryParams.assignedTo;

  if (queryParams.search) {
    const term = String(queryParams.search).trim();
    if (term) {
      const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(safe, 'i');
      andFilters.push({ $or: [{ title: regex }, { description: regex }] });
    }
  }

  const finalQuery = andFilters.length > 0 ? { $and: [filters, ...andFilters] } : filters;

  const sortField = queryParams.sortBy || 'dueDate';
  const sortOrder = queryParams.sortOrder === 'desc' ? -1 : 1;

  const [items, total] = await Promise.all([
    Task.find(finalQuery)
      .populate(POPULATE_FIELDS)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(finalQuery),
  ]);

  return {
    tasks: applyOverdueToList(items),
    pagination: buildMeta({ total, page, limit }),
  };
}

async function getTodayFollowUps(user) {
  await sweepOverdue(user);

  const today = startOfToday();
  const todayEnd = endOfToday();

  const taskFilter = {
    ...scopeQuery(user),
    dueDate: { $gte: today, $lte: todayEnd },
    status: { $ne: 'Completed' },
  };

  const leadFilter = {
    ...leadScopeQuery(user),
    nextFollowUpDate: { $gte: today, $lte: todayEnd },
  };

  const [tasks, leads] = await Promise.all([
    Task.find(taskFilter).populate(POPULATE_FIELDS).sort({ dueDate: 1 }).lean(),
    Lead.find(leadFilter, {
      _id: 1,
      customerName: 1,
      phone: 1,
      status: 1,
      nextFollowUpDate: 1,
    }).sort({ nextFollowUpDate: 1 }).lean(),
  ]);

  return {
    tasks: applyOverdueToList(tasks),
    leads,
  };
}

async function getOverdueFollowUps(user) {
  await sweepOverdue(user);

  const today = startOfToday();

  const filter = {
    ...scopeQuery(user),
    dueDate: { $lt: today },
    status: { $ne: 'Completed' },
  };

  const tasks = await Task.find(filter)
    .populate(POPULATE_FIELDS)
    .sort({ dueDate: 1 })
    .lean();

  return { tasks: applyOverdueToList(tasks) };
}

async function getTaskById(id, user) {
  const task = await Task.findById(id).populate(POPULATE_FIELDS);
  if (!task) throw notFound();
  if (!userCanAccess(task, user)) throw forbidden('You do not have access to this task');
  applyOverdueStatus(task);
  return task;
}

async function createTask(payload, user) {
  if (user.role !== 'admin' && payload.assignedTo && payload.assignedTo !== user.id) {
    throw forbidden('You can only assign tasks to yourself');
  }

  const task = await Task.create({
    title: payload.title,
    description: payload.description,
    dueDate: payload.dueDate,
    priority: payload.priority || 'Medium',
    status: payload.status || 'Pending',
    lead: payload.lead || null,
    assignedTo: payload.assignedTo || null,
    createdBy: user.id,
  });

  applyOverdueStatus(task);
  if (task.isModified('status')) await task.save();

  return task.populate(POPULATE_FIELDS);
}

async function updateTask(id, payload, user) {
  const task = await Task.findById(id);
  if (!task) throw notFound();
  if (!userCanAccess(task, user)) throw forbidden('You do not have access to this task');

  if (user.role !== 'admin' && payload.assignedTo && payload.assignedTo !== user.id) {
    throw forbidden('You can only assign tasks to yourself');
  }

  const allowed = ['title', 'description', 'dueDate', 'priority', 'status', 'lead', 'assignedTo'];
  allowed.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      task[field] = payload[field];
    }
  });

  if (task.status === 'Completed' && !task.completedAt) {
    task.completedAt = new Date();
  } else if (task.status !== 'Completed') {
    task.completedAt = null;
  }

  applyOverdueStatus(task);

  await task.save();
  return task.populate(POPULATE_FIELDS);
}

async function completeTask(id, user) {
  const task = await Task.findById(id);
  if (!task) throw notFound();
  if (!userCanAccess(task, user)) throw forbidden('You do not have access to this task');

  task.status = 'Completed';
  task.completedAt = new Date();
  await task.save();
  return task.populate(POPULATE_FIELDS);
}

async function deleteTask(id, user) {
  const task = await Task.findById(id);
  if (!task) throw notFound();
  if (!userCanDelete(task, user)) {
    throw forbidden('You do not have permission to delete this task');
  }
  await task.deleteOne();
  return { id };
}

module.exports = {
  listTasks,
  getTodayFollowUps,
  getOverdueFollowUps,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
};
