const Quotation = require('../models/Quotation');
const Lead = require('../models/Lead');
const { parsePagination, buildMeta } = require('../utils/pagination');

const POPULATE_FIELDS = [
  { path: 'lead', select: 'customerName phone status createdBy assignedTo' },
  { path: 'createdBy', select: 'name email role' },
];

function notFound() {
  const err = new Error('Quotation not found');
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

function badRequest(message, errors = []) {
  const err = new Error(message);
  err.statusCode = 400;
  err.errors = errors;
  return err;
}

async function scopeQuery(user) {
  if (user.role === 'admin') return {};
  // User can see quotations they created OR linked to a lead they own/are assigned to.
  const ownedLeadIds = await Lead.find(
    { $or: [{ createdBy: user.id }, { assignedTo: user.id }] },
    { _id: 1 }
  ).lean();
  const leadIds = ownedLeadIds.map((l) => l._id);
  return { $or: [{ createdBy: user.id }, { lead: { $in: leadIds } }] };
}

async function userHasLeadAccess(leadId, user) {
  if (user.role === 'admin') return true;
  const lead = await Lead.findById(leadId).lean();
  if (!lead) return false;
  const createdBy = lead.createdBy?.toString();
  const assignedTo = lead.assignedTo?.toString();
  return createdBy === user.id || assignedTo === user.id;
}

async function userCanAccessQuotation(quotation, user) {
  if (user.role === 'admin') return true;
  const createdBy = quotation.createdBy?._id?.toString() || quotation.createdBy?.toString();
  if (createdBy === user.id) return true;
  const leadId =
    quotation.lead?._id?.toString() || quotation.lead?.toString();
  if (!leadId) return false;
  return userHasLeadAccess(leadId, user);
}

async function generateUniqueCode() {
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;
  const last = await Quotation.findOne({ quotationCode: new RegExp(`^${prefix}`) })
    .sort({ quotationCode: -1 })
    .lean();
  let next = 1;
  if (last?.quotationCode) {
    const match = last.quotationCode.match(/(\d+)$/);
    if (match) next = parseInt(match[1], 10) + 1;
  }
  return `${prefix}${String(next).padStart(3, '0')}`;
}

async function listQuotations(user, queryParams = {}) {
  const { page, limit, skip } = parsePagination(queryParams);
  const filters = await scopeQuery(user);

  if (queryParams.status) filters.status = queryParams.status;
  if (queryParams.lead) filters.lead = queryParams.lead;

  if (queryParams.search) {
    const term = queryParams.search.trim();
    if (term) {
      const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(safe, 'i');
      filters.$and = (filters.$and || []).concat([
        { $or: [{ quotationCode: regex }, { customerName: regex }] },
      ]);
    }
  }

  const sortField = queryParams.sortBy || 'createdAt';
  const sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    Quotation.find(filters)
      .populate(POPULATE_FIELDS)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Quotation.countDocuments(filters),
  ]);

  return {
    quotations: items,
    pagination: buildMeta({ total, page, limit }),
  };
}

async function listByLead(leadId, user) {
  const hasAccess = await userHasLeadAccess(leadId, user);
  if (!hasAccess) throw forbidden('You do not have access to this lead');
  return Quotation.find({ lead: leadId })
    .populate(POPULATE_FIELDS)
    .sort({ createdAt: -1 })
    .lean();
}

async function getQuotationById(id, user) {
  const quotation = await Quotation.findById(id).populate(POPULATE_FIELDS);
  if (!quotation) throw notFound();
  const allowed = await userCanAccessQuotation(quotation, user);
  if (!allowed) throw forbidden('You do not have access to this quotation');
  return quotation;
}

async function createQuotation(payload, user) {
  if (!payload.lead) throw badRequest('lead is required');
  const hasAccess = await userHasLeadAccess(payload.lead, user);
  if (!hasAccess) throw forbidden('You do not have access to this lead');

  const lead = await Lead.findById(payload.lead);
  if (!lead) throw badRequest('Linked lead does not exist');

  let code = payload.quotationCode ? String(payload.quotationCode).trim().toUpperCase() : '';
  if (!code) {
    code = await generateUniqueCode();
  } else {
    const exists = await Quotation.findOne({ quotationCode: code }).lean();
    if (exists) {
      throw badRequest('Quotation code already exists', [
        { field: 'quotationCode', message: 'Quotation code must be unique' },
      ]);
    }
  }

  try {
    const quotation = await Quotation.create({
      quotationCode: code,
      lead: payload.lead,
      customerName: (payload.customerName || lead.customerName || '').trim(),
      items: payload.items,
      discount: payload.discount ?? 0,
      tax: payload.tax ?? 0,
      status: payload.status || 'Draft',
      validUntil: payload.validUntil || null,
      notes: payload.notes,
      createdBy: user.id,
    });
    return quotation.populate(POPULATE_FIELDS);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.quotationCode) {
      throw badRequest('Quotation code already exists', [
        { field: 'quotationCode', message: 'Quotation code must be unique' },
      ]);
    }
    throw err;
  }
}

async function updateQuotation(id, payload, user) {
  const quotation = await Quotation.findById(id);
  if (!quotation) throw notFound();
  const allowed = await userCanAccessQuotation(quotation, user);
  if (!allowed) throw forbidden('You do not have access to this quotation');

  // Once Accepted, items are locked.
  if (quotation.status === 'Accepted' && payload.items) {
    throw badRequest('Items cannot be edited on an Accepted quotation');
  }

  if (payload.lead && payload.lead.toString() !== quotation.lead.toString()) {
    const hasAccess = await userHasLeadAccess(payload.lead, user);
    if (!hasAccess) throw forbidden('You do not have access to the target lead');
    quotation.lead = payload.lead;
  }

  if (payload.quotationCode !== undefined && payload.quotationCode !== quotation.quotationCode) {
    const code = String(payload.quotationCode).trim().toUpperCase();
    const exists = await Quotation.findOne({ quotationCode: code, _id: { $ne: quotation._id } }).lean();
    if (exists) {
      throw badRequest('Quotation code already exists', [
        { field: 'quotationCode', message: 'Quotation code must be unique' },
      ]);
    }
    quotation.quotationCode = code;
  }

  const simpleFields = ['customerName', 'discount', 'tax', 'validUntil', 'notes', 'status'];
  simpleFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      quotation[field] = payload[field];
    }
  });

  if (payload.items) {
    quotation.items = payload.items;
  }

  await quotation.save();
  return quotation.populate(POPULATE_FIELDS);
}

/**
 * Update only the status. Optionally propagate a status change to the linked lead.
 * Accepted/Rejected can suggest a lead status — caller passes `leadStatus` if so.
 */
async function updateStatus(id, { status, leadStatus }, user) {
  const quotation = await Quotation.findById(id);
  if (!quotation) throw notFound();
  const allowed = await userCanAccessQuotation(quotation, user);
  if (!allowed) throw forbidden('You do not have access to this quotation');

  quotation.status = status;
  await quotation.save();

  let updatedLead = null;
  if (leadStatus) {
    if (status === 'Accepted' && leadStatus !== 'Won') {
      throw badRequest('When accepting a quotation, leadStatus can only be "Won"');
    }
    if (status === 'Rejected' && !['Negotiating', 'Lost'].includes(leadStatus)) {
      throw badRequest('When rejecting a quotation, leadStatus must be "Negotiating" or "Lost"');
    }
    if (!['Accepted', 'Rejected'].includes(status)) {
      throw badRequest('leadStatus can only be set when accepting or rejecting');
    }
    const lead = await Lead.findById(quotation.lead);
    if (lead) {
      lead.status = leadStatus;
      await lead.save();
      updatedLead = lead.toObject();
    }
  }

  const populated = await quotation.populate(POPULATE_FIELDS);
  return { quotation: populated, lead: updatedLead };
}

async function deleteQuotation(id, user) {
  const quotation = await Quotation.findById(id);
  if (!quotation) throw notFound();
  const allowed = await userCanAccessQuotation(quotation, user);
  if (!allowed) throw forbidden('You do not have access to this quotation');
  if (quotation.status !== 'Draft') {
    throw badRequest('Only Draft quotations can be deleted');
  }
  // Owner or admin only — assignee on the lead alone is not enough to delete.
  if (user.role !== 'admin' && quotation.createdBy.toString() !== user.id) {
    throw forbidden('Only the creator or an admin can delete a quotation');
  }
  await quotation.deleteOne();
  return { id };
}

module.exports = {
  listQuotations,
  listByLead,
  getQuotationById,
  createQuotation,
  updateQuotation,
  updateStatus,
  deleteQuotation,
  generateUniqueCode,
};
