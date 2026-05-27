const quotationService = require('../services/quotation.service');
const { successResponse } = require('../utils/response');

async function listQuotations(req, res, next) {
  try {
    const data = await quotationService.listQuotations(req.user, req.query);
    return successResponse(res, 200, 'Quotations retrieved', data);
  } catch (err) {
    return next(err);
  }
}

async function listByLead(req, res, next) {
  try {
    const data = await quotationService.listByLead(req.params.leadId, req.user);
    return successResponse(res, 200, 'Quotations for lead', { quotations: data });
  } catch (err) {
    return next(err);
  }
}

async function getQuotation(req, res, next) {
  try {
    const data = await quotationService.getQuotationById(req.params.id, req.user);
    return successResponse(res, 200, 'Quotation retrieved', data);
  } catch (err) {
    return next(err);
  }
}

async function generateCode(req, res, next) {
  try {
    const code = await quotationService.generateUniqueCode();
    return successResponse(res, 200, 'Quotation code generated', { quotationCode: code });
  } catch (err) {
    return next(err);
  }
}

async function createQuotation(req, res, next) {
  try {
    const data = await quotationService.createQuotation(req.body, req.user);
    return successResponse(res, 201, 'Quotation created', data);
  } catch (err) {
    return next(err);
  }
}

async function updateQuotation(req, res, next) {
  try {
    const data = await quotationService.updateQuotation(req.params.id, req.body, req.user);
    return successResponse(res, 200, 'Quotation updated', data);
  } catch (err) {
    return next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status, leadStatus } = req.body;
    const data = await quotationService.updateStatus(req.params.id, { status, leadStatus }, req.user);
    return successResponse(res, 200, 'Quotation status updated', data);
  } catch (err) {
    return next(err);
  }
}

async function deleteQuotation(req, res, next) {
  try {
    const data = await quotationService.deleteQuotation(req.params.id, req.user);
    return successResponse(res, 200, 'Quotation deleted', data);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listQuotations,
  listByLead,
  getQuotation,
  generateCode,
  createQuotation,
  updateQuotation,
  updateStatus,
  deleteQuotation,
};
