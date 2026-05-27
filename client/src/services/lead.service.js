import api from './api';

function unwrap(data) {
  return data?.data;
}

async function listLeads(params = {}) {
  const { data } = await api.get('/leads', { params });
  return unwrap(data);
}

async function getLead(id) {
  const { data } = await api.get(`/leads/${id}`);
  return unwrap(data);
}

async function createLead(payload) {
  const { data } = await api.post('/leads', payload);
  return unwrap(data);
}

async function updateLead(id, payload) {
  const { data } = await api.put(`/leads/${id}`, payload);
  return unwrap(data);
}

async function updateLeadStatus(id, status) {
  const { data } = await api.patch(`/leads/${id}/status`, { status });
  return unwrap(data);
}

async function addLeadNote(id, body) {
  const { data } = await api.post(`/leads/${id}/notes`, { body });
  return unwrap(data);
}

async function deleteLead(id) {
  const { data } = await api.delete(`/leads/${id}`);
  return unwrap(data);
}

export default {
  listLeads,
  getLead,
  createLead,
  updateLead,
  updateLeadStatus,
  addLeadNote,
  deleteLead,
};
