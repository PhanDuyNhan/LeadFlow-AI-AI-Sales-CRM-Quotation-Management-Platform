const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Quotation = require('../models/Quotation');
const Task = require('../models/Task');

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

function startOfMonth(year, monthIndex) {
  return new Date(year, monthIndex, 1, 0, 0, 0, 0);
}

// MongoDB match clause for the role-scoped subset of a collection.
// Admins: no filter. Regular users: createdBy OR assignedTo matches their id.
function scopeFor(user, { withAssignedTo = true } = {}) {
  if (user.role === 'admin') return {};
  const userId = new mongoose.Types.ObjectId(user.id);
  if (!withAssignedTo) return { createdBy: userId };
  return { $or: [{ createdBy: userId }, { assignedTo: userId }] };
}

// Quotation visibility: created by the user OR linked to a lead the user owns/is assigned to.
async function quotationScopeFor(user) {
  if (user.role === 'admin') return {};
  const userId = new mongoose.Types.ObjectId(user.id);
  const visibleLeadIds = await Lead.find(
    { $or: [{ createdBy: userId }, { assignedTo: userId }] },
    { _id: 1 }
  ).lean();
  const ids = visibleLeadIds.map((l) => l._id);
  return { $or: [{ createdBy: userId }, { lead: { $in: ids } }] };
}

async function getSummary(user) {
  const leadScope = scopeFor(user);
  const taskScope = scopeFor(user);
  const quotationScope = await quotationScopeFor(user);

  const today = startOfToday();
  const todayEnd = endOfToday();

  const [
    totalLeads,
    newLeads,
    hotLeads,
    warmLeads,
    coldLeads,
    wonLeads,
    totalQuotations,
    sentQuotations,
    acceptedQuotations,
    revenueAgg,
    followUpTasksToday,
    followUpLeadsToday,
    overdueFollowUps,
  ] = await Promise.all([
    Lead.countDocuments(leadScope),
    Lead.countDocuments({ ...leadScope, status: 'New' }),
    Lead.countDocuments({ ...leadScope, leadScore: 'Hot' }),
    Lead.countDocuments({ ...leadScope, leadScore: 'Warm' }),
    Lead.countDocuments({ ...leadScope, leadScore: 'Cold' }),
    Lead.countDocuments({ ...leadScope, status: 'Won' }),
    Quotation.countDocuments(quotationScope),
    Quotation.countDocuments({ ...quotationScope, status: 'Sent' }),
    Quotation.countDocuments({ ...quotationScope, status: 'Accepted' }),
    Quotation.aggregate([
      { $match: { ...quotationScope, status: { $in: ['Sent', 'Accepted'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Task.countDocuments({
      ...taskScope,
      status: { $ne: 'Completed' },
      dueDate: { $gte: today, $lte: todayEnd },
    }),
    Lead.countDocuments({
      ...leadScope,
      nextFollowUpDate: { $gte: today, $lte: todayEnd },
    }),
    Task.countDocuments({
      ...taskScope,
      status: { $ne: 'Completed' },
      dueDate: { $lt: today },
    }),
  ]);

  const estimatedRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
  const conversionRate =
    totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0;

  return {
    totalLeads,
    newLeads,
    hotLeads,
    warmLeads,
    coldLeads,
    wonLeads,
    totalQuotations,
    sentQuotations,
    acceptedQuotations,
    estimatedRevenue,
    conversionRate,
    followUpsToday: followUpTasksToday + followUpLeadsToday,
    followUpTasksToday,
    followUpLeadsToday,
    overdueFollowUps,
  };
}

async function getLeadByStatus(user) {
  const match = scopeFor(user);
  const rows = await Lead.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const all = Lead.LEAD_STATUSES || ['New', 'Contacted', 'Qualified', 'Quoted', 'Negotiating', 'Won', 'Lost'];
  const byStatus = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  return all.map((status) => ({ status, count: byStatus[status] || 0 }));
}

async function getLeadBySource(user) {
  const match = scopeFor(user);
  const rows = await Lead.aggregate([
    { $match: match },
    { $group: { _id: { $ifNull: ['$source', 'Unknown'] }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return rows.map((r) => ({ source: r._id, count: r.count }));
}

async function getQuotationStatusStats(user) {
  const match = await quotationScopeFor(user);
  const rows = await Quotation.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
  ]);

  const all = Quotation.QUOTATION_STATUSES || ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'];
  const byStatus = Object.fromEntries(rows.map((r) => [r._id, r]));
  return all.map((status) => ({
    status,
    count: byStatus[status]?.count || 0,
    totalAmount: byStatus[status]?.total || 0,
  }));
}

async function getRevenueForecast(user, months = 6) {
  const match = await quotationScopeFor(user);
  const now = new Date();
  const startMonth = startOfMonth(now.getFullYear(), now.getMonth() - (months - 1));

  const rows = await Quotation.aggregate([
    {
      $match: {
        ...match,
        status: { $in: ['Sent', 'Accepted'] },
        createdAt: { $gte: startMonth },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        sent: {
          $sum: { $cond: [{ $eq: ['$status', 'Sent'] }, '$totalAmount', 0] },
        },
        accepted: {
          $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, '$totalAmount', 0] },
        },
        total: { $sum: '$totalAmount' },
      },
    },
  ]);

  const byKey = Object.fromEntries(
    rows.map((r) => [`${r._id.year}-${r._id.month}`, r])
  );

  const buckets = [];
  for (let i = 0; i < months; i += 1) {
    const d = startOfMonth(now.getFullYear(), now.getMonth() - (months - 1 - i));
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const row = byKey[key];
    buckets.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
      sent: row?.sent || 0,
      accepted: row?.accepted || 0,
      total: row?.total || 0,
    });
  }
  return buckets;
}

async function getTopHotLeads(user, limit = 5) {
  const match = { ...scopeFor(user), leadScore: 'Hot' };
  const leads = await Lead.find(match, {
    customerName: 1,
    phone: 1,
    status: 1,
    leadScore: 1,
    budget: 1,
    nextFollowUpDate: 1,
    updatedAt: 1,
  })
    .sort({ budget: -1, updatedAt: -1 })
    .limit(limit)
    .lean();
  return leads;
}

async function getTodayFollowUps(user) {
  const today = startOfToday();
  const todayEnd = endOfToday();
  const leadScope = scopeFor(user);
  const taskScope = scopeFor(user);

  const [tasks, leads] = await Promise.all([
    Task.find({
      ...taskScope,
      status: { $ne: 'Completed' },
      dueDate: { $gte: today, $lte: todayEnd },
    })
      .populate('lead', 'customerName phone status')
      .sort({ dueDate: 1 })
      .lean(),
    Lead.find(
      { ...leadScope, nextFollowUpDate: { $gte: today, $lte: todayEnd } },
      { customerName: 1, phone: 1, status: 1, nextFollowUpDate: 1 }
    )
      .sort({ nextFollowUpDate: 1 })
      .lean(),
  ]);

  return { tasks, leads };
}

async function getOverdueFollowUps(user, limit = 10) {
  const today = startOfToday();
  const tasks = await Task.find({
    ...scopeFor(user),
    status: { $ne: 'Completed' },
    dueDate: { $lt: today },
  })
    .populate('lead', 'customerName phone status')
    .sort({ dueDate: 1 })
    .limit(limit)
    .lean();
  return { tasks };
}

async function getDashboard(user) {
  const [
    summary,
    leadByStatus,
    leadBySource,
    quotationByStatus,
    revenueForecast,
    topHotLeads,
    todayFollowUps,
    overdueFollowUps,
  ] = await Promise.all([
    getSummary(user),
    getLeadByStatus(user),
    getLeadBySource(user),
    getQuotationStatusStats(user),
    getRevenueForecast(user),
    getTopHotLeads(user),
    getTodayFollowUps(user),
    getOverdueFollowUps(user),
  ]);

  return {
    summary,
    charts: {
      leadByStatus,
      leadBySource,
      quotationByStatus,
      revenueForecast,
    },
    topHotLeads,
    todayFollowUps,
    overdueFollowUps,
  };
}

module.exports = {
  getDashboard,
  getSummary,
  getLeadByStatus,
  getLeadBySource,
  getQuotationStatusStats,
  getRevenueForecast,
  getTopHotLeads,
  getTodayFollowUps,
  getOverdueFollowUps,
};
