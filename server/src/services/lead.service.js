const Lead = require('../models/Lead');
const { parsePagination, buildMeta } = require('../utils/pagination');
const aiService = require('./aiService');

const POPULATE_FIELDS = [
  { path: 'createdBy', select: 'name email role' },
  { path: 'assignedTo', select: 'name email role' },
  { path: 'notes.author', select: 'name email' },
];

function scopeQuery(user) {
  if (user.role === 'admin') return {};
  return { $or: [{ createdBy: user.id }, { assignedTo: user.id }] };
}

function canDelete(lead, user) {
  if (user.role === 'admin') return true;
  return lead.createdBy && lead.createdBy.toString() === user.id;
}

function notFound() {
  const err = new Error('Lead not found');
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

async function listLeads(user, queryParams = {}) {
  const { page, limit, skip } = parsePagination(queryParams);
  const filters = { ...scopeQuery(user) };
  const andFilters = [];

  if (queryParams.status) filters.status = queryParams.status;
  if (queryParams.source) filters.source = queryParams.source;
  if (queryParams.leadScore) filters.leadScore = queryParams.leadScore;
  if (queryParams.assignedTo) filters.assignedTo = queryParams.assignedTo;

  if (queryParams.dateFrom || queryParams.dateTo) {
    const createdAt = {};
    if (queryParams.dateFrom) createdAt.$gte = new Date(queryParams.dateFrom);
    if (queryParams.dateTo) createdAt.$lte = new Date(queryParams.dateTo);
    filters.createdAt = createdAt;
  }

  if (queryParams.search) {
    const term = queryParams.search.trim();
    if (term.length > 0) {
      const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(safe, 'i');
      andFilters.push({
        $or: [
          { customerName: regex },
          { phone: regex },
          { email: regex },
          { company: regex },
        ],
      });
    }
  }

  const finalQuery = andFilters.length > 0 ? { $and: [filters, ...andFilters] } : filters;

  const sortField = queryParams.sortBy || 'createdAt';
  const sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    Lead.find(finalQuery)
      .populate(POPULATE_FIELDS)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(finalQuery),
  ]);

  return {
    leads: items,
    pagination: buildMeta({ total, page, limit }),
  };
}

async function listLeadsMinimal(user) {
  const filters = scopeQuery(user);
  return Lead.find(filters, { _id: 1, customerName: 1, status: 1 })
    .sort({ customerName: 1 })
    .lean();
}

async function getLeadById(id, user) {
  const lead = await Lead.findById(id).populate(POPULATE_FIELDS);
  if (!lead) throw notFound();

  if (user.role !== 'admin') {
    const createdBy = lead.createdBy?._id?.toString() || lead.createdBy?.toString();
    const assignedTo = lead.assignedTo?._id?.toString() || lead.assignedTo?.toString();
    if (createdBy !== user.id && assignedTo !== user.id) throw forbidden('You do not have access to this lead');
  }

  return lead;
}

async function createLead(payload, user) {
  // Regular users may only assign leads to themselves; admins may assign freely.
  if (user.role !== 'admin' && payload.assignedTo && payload.assignedTo !== user.id) {
    throw forbidden('You can only assign leads to yourself');
  }

  const lead = await Lead.create({
    customerName: payload.customerName,
    phone: payload.phone,
    email: payload.email,
    company: payload.company,
    source: payload.source,
    needDescription: payload.needDescription,
    budget: payload.budget ?? 0,
    timeline: payload.timeline,
    // New leads always default to status "New" — ignore client-supplied value on create.
    status: 'New',
    leadScore: payload.leadScore,
    scoreReason: payload.scoreReason,
    suggestedAction: payload.suggestedAction,
    assignedTo: payload.assignedTo || null,
    createdBy: user.id,
    nextFollowUpDate: payload.nextFollowUpDate || null,
  });

  return lead.populate(POPULATE_FIELDS);
}

async function updateLead(id, payload, user) {
  const lead = await Lead.findById(id);
  if (!lead) throw notFound();

  if (user.role !== 'admin') {
    const createdBy = lead.createdBy?.toString();
    const assignedTo = lead.assignedTo?.toString();
    if (createdBy !== user.id && assignedTo !== user.id) throw forbidden('You do not have access to this lead');
    if (payload.assignedTo && payload.assignedTo !== user.id) {
      throw forbidden('You can only assign leads to yourself');
    }
  }

  const allowed = [
    'customerName',
    'phone',
    'email',
    'company',
    'source',
    'needDescription',
    'budget',
    'timeline',
    'status',
    'leadScore',
    'scoreReason',
    'suggestedAction',
    'assignedTo',
    'nextFollowUpDate',
  ];

  allowed.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      lead[field] = payload[field];
    }
  });

  await lead.save();
  return lead.populate(POPULATE_FIELDS);
}

async function updateLeadStatus(id, status, user) {
  return updateLead(id, { status }, user);
}

async function addNote(id, body, user) {
  const lead = await Lead.findById(id);
  if (!lead) throw notFound();

  if (user.role !== 'admin') {
    const createdBy = lead.createdBy?.toString();
    const assignedTo = lead.assignedTo?.toString();
    if (createdBy !== user.id && assignedTo !== user.id) throw forbidden('You do not have access to this lead');
  }

  lead.notes.push({ body, author: user.id });
  await lead.save();
  return lead.populate(POPULATE_FIELDS);
}

async function analyzeLead(id, user) {
  const lead = await Lead.findById(id);
  if (!lead) throw notFound();

  if (user.role !== 'admin') {
    const createdBy = lead.createdBy?.toString();
    const assignedTo = lead.assignedTo?.toString();
    if (createdBy !== user.id && assignedTo !== user.id) throw forbidden('You do not have access to this lead');
  }

  const analysis = aiService.scoreLead(lead.toObject());
  lead.leadScore = analysis.score;
  lead.scoreReason = analysis.reason;
  lead.suggestedAction = analysis.suggestedAction;
  await lead.save();

  const populated = await lead.populate(POPULATE_FIELDS);
  return { lead: populated, analysis };
}

async function deleteLead(id, user) {
  const lead = await Lead.findById(id);
  if (!lead) throw notFound();

  if (!canDelete(lead, user)) {
    throw forbidden('You do not have permission to delete this lead');
  }

  await lead.deleteOne();
  return { id };
}

module.exports = {
  listLeads,
  listLeadsMinimal,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  addNote,
  analyzeLead,
  deleteLead,
};
