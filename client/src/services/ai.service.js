import api from './api';

function unwrap(data) {
  return data?.data;
}

async function analyzeLead(leadId) {
  const { data } = await api.post(`/leads/${leadId}/analyze`);
  return unwrap(data);
}

async function generateFollowUpMessage(payload) {
  const { data } = await api.post('/ai/follow-up-message', payload);
  return unwrap(data);
}

async function getFollowUpPurposes() {
  const { data } = await api.get('/ai/follow-up-purposes');
  return unwrap(data);
}

export const FOLLOW_UP_PURPOSES = [
  'First contact',
  'After quotation',
  'Payment reminder',
  'Meeting reminder',
  'Re-engagement',
  'Thank you message',
];

export default { analyzeLead, generateFollowUpMessage, getFollowUpPurposes };
