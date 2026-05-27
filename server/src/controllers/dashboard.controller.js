const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../utils/response');

async function getDashboard(req, res, next) {
  try {
    const data = await dashboardService.getDashboard(req.user);
    return successResponse(res, 200, 'Dashboard data', data);
  } catch (err) {
    return next(err);
  }
}

async function getSummary(req, res, next) {
  try {
    const data = await dashboardService.getSummary(req.user);
    return successResponse(res, 200, 'Dashboard summary', data);
  } catch (err) {
    return next(err);
  }
}

async function getLeadByStatus(req, res, next) {
  try {
    const data = await dashboardService.getLeadByStatus(req.user);
    return successResponse(res, 200, 'Lead by status', { leadByStatus: data });
  } catch (err) {
    return next(err);
  }
}

async function getLeadBySource(req, res, next) {
  try {
    const data = await dashboardService.getLeadBySource(req.user);
    return successResponse(res, 200, 'Lead by source', { leadBySource: data });
  } catch (err) {
    return next(err);
  }
}

async function getQuotationStatusStats(req, res, next) {
  try {
    const data = await dashboardService.getQuotationStatusStats(req.user);
    return successResponse(res, 200, 'Quotation status stats', { quotationByStatus: data });
  } catch (err) {
    return next(err);
  }
}

async function getRevenueForecast(req, res, next) {
  try {
    const data = await dashboardService.getRevenueForecast(req.user);
    return successResponse(res, 200, 'Revenue forecast', { revenueForecast: data });
  } catch (err) {
    return next(err);
  }
}

async function getTopHotLeads(req, res, next) {
  try {
    const data = await dashboardService.getTopHotLeads(req.user);
    return successResponse(res, 200, 'Top hot leads', { leads: data });
  } catch (err) {
    return next(err);
  }
}

async function getTodayFollowUps(req, res, next) {
  try {
    const data = await dashboardService.getTodayFollowUps(req.user);
    return successResponse(res, 200, "Today's follow-ups", data);
  } catch (err) {
    return next(err);
  }
}

async function getOverdueFollowUps(req, res, next) {
  try {
    const data = await dashboardService.getOverdueFollowUps(req.user);
    return successResponse(res, 200, 'Overdue follow-ups', data);
  } catch (err) {
    return next(err);
  }
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
