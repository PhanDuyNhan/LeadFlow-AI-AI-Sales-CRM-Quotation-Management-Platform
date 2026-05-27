import api from './api';

function unwrap(data) {
  return data?.data;
}

async function getDashboard() {
  const { data } = await api.get('/dashboard');
  return unwrap(data);
}

async function getSummary() {
  const { data } = await api.get('/dashboard/summary');
  return unwrap(data);
}

async function getLeadByStatus() {
  const { data } = await api.get('/dashboard/lead-by-status');
  return unwrap(data);
}

async function getLeadBySource() {
  const { data } = await api.get('/dashboard/lead-by-source');
  return unwrap(data);
}

async function getQuotationStatusStats() {
  const { data } = await api.get('/dashboard/quotation-status');
  return unwrap(data);
}

async function getRevenueForecast() {
  const { data } = await api.get('/dashboard/revenue-forecast');
  return unwrap(data);
}

async function getTopHotLeads() {
  const { data } = await api.get('/dashboard/top-hot-leads');
  return unwrap(data);
}

async function getTodayFollowUps() {
  const { data } = await api.get('/dashboard/follow-ups/today');
  return unwrap(data);
}

async function getOverdueFollowUps() {
  const { data } = await api.get('/dashboard/follow-ups/overdue');
  return unwrap(data);
}

export default {
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
