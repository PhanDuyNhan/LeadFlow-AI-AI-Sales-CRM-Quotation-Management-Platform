import api from './api';

function unwrap(data) {
  return data?.data;
}

async function listTasks(params = {}) {
  const { data } = await api.get('/tasks', { params });
  return unwrap(data);
}

async function getTodayFollowUps() {
  const { data } = await api.get('/tasks/today');
  return unwrap(data);
}

async function getOverdueFollowUps() {
  const { data } = await api.get('/tasks/overdue');
  return unwrap(data);
}

async function getTask(id) {
  const { data } = await api.get(`/tasks/${id}`);
  return unwrap(data);
}

async function createTask(payload) {
  const { data } = await api.post('/tasks', payload);
  return unwrap(data);
}

async function updateTask(id, payload) {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return unwrap(data);
}

async function completeTask(id) {
  const { data } = await api.patch(`/tasks/${id}/complete`);
  return unwrap(data);
}

async function deleteTask(id) {
  const { data } = await api.delete(`/tasks/${id}`);
  return unwrap(data);
}

async function listLeadsMinimal() {
  const { data } = await api.get('/leads/minimal');
  return unwrap(data);
}

export default {
  listTasks,
  getTodayFollowUps,
  getOverdueFollowUps,
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  listLeadsMinimal,
};
