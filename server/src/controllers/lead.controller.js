const leadService = require('../services/lead.service');
const { successResponse } = require('../utils/response');

async function listLeads(req, res, next) {
  try {
    const data = await leadService.listLeads(req.user, req.query);
    return successResponse(res, 200, 'Leads retrieved', data);
  } catch (err) {
    return next(err);
  }
}

async function listLeadsMinimal(req, res, next) {
  try {
    const data = await leadService.listLeadsMinimal(req.user);
    return successResponse(res, 200, 'Leads minimal list', { leads: data });
  } catch (err) {
    return next(err);
  }
}

async function getLead(req, res, next) {
  try {
    const lead = await leadService.getLeadById(req.params.id, req.user);
    return successResponse(res, 200, 'Lead retrieved', lead);
  } catch (err) {
    return next(err);
  }
}

async function createLead(req, res, next) {
  try {
    const lead = await leadService.createLead(req.body, req.user);
    return successResponse(res, 201, 'Lead created', lead);
  } catch (err) {
    return next(err);
  }
}

async function updateLead(req, res, next) {
  try {
    const lead = await leadService.updateLead(req.params.id, req.body, req.user);
    return successResponse(res, 200, 'Lead updated', lead);
  } catch (err) {
    return next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const lead = await leadService.updateLeadStatus(req.params.id, req.body.status, req.user);
    return successResponse(res, 200, 'Lead status updated', lead);
  } catch (err) {
    return next(err);
  }
}

async function addNote(req, res, next) {
  try {
    const lead = await leadService.addNote(req.params.id, req.body.body, req.user);
    return successResponse(res, 201, 'Note added', lead);
  } catch (err) {
    return next(err);
  }
}

async function analyzeLead(req, res, next) {
  try {
    const data = await leadService.analyzeLead(req.params.id, req.user);
    return successResponse(res, 200, 'Lead analyzed', data);
  } catch (err) {
    return next(err);
  }
}

async function deleteLead(req, res, next) {
  try {
    const result = await leadService.deleteLead(req.params.id, req.user);
    return successResponse(res, 200, 'Lead deleted', result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listLeads,
  listLeadsMinimal,
  getLead,
  createLead,
  updateLead,
  updateStatus,
  addNote,
  analyzeLead,
  deleteLead,
};
