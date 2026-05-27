import api from './api';

function unwrap(data) {
  return data?.data;
}

async function listQuotations(params = {}) {
  const { data } = await api.get('/quotations', { params });
  return unwrap(data);
}

async function listByLead(leadId) {
  const { data } = await api.get(`/quotations/by-lead/${leadId}`);
  return unwrap(data);
}

async function getQuotation(id) {
  const { data } = await api.get(`/quotations/${id}`);
  return unwrap(data);
}

async function createQuotation(payload) {
  const { data } = await api.post('/quotations', payload);
  return unwrap(data);
}

async function updateQuotation(id, payload) {
  const { data } = await api.put(`/quotations/${id}`, payload);
  return unwrap(data);
}

async function updateQuotationStatus(id, payload) {
  const { data } = await api.patch(`/quotations/${id}/status`, payload);
  return unwrap(data);
}

async function deleteQuotation(id) {
  const { data } = await api.delete(`/quotations/${id}`);
  return unwrap(data);
}

async function generateCode() {
  const { data } = await api.get('/quotations/generate-code');
  return unwrap(data);
}

async function listLeadsMinimal() {
  const { data } = await api.get('/leads/minimal');
  return unwrap(data);
}

export default {
  listQuotations,
  listByLead,
  getQuotation,
  createQuotation,
  updateQuotation,
  updateQuotationStatus,
  deleteQuotation,
  generateCode,
  listLeadsMinimal,
};
