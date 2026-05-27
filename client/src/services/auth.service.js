import api from './api';

async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data.data;
}

async function login(payload) {
  const { data } = await api.post('/auth/login', payload);
  return data.data;
}

async function getMe() {
  const { data } = await api.get('/auth/me');
  return data.data;
}

export default { register, login, getMe };
