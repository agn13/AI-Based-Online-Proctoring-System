import api from './api';

export function login(username, password, role) {
  // Replace with real API from backend
  return api.post('/auth/login', { username, password, role });
}

export function register(username, password, role, name) {
  // Replace with real API from backend
  return api.post('/auth/register', { username, password, role, name });
}

export function saveAuthData({ token, user }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function getCurrentUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getJwt() {
  return localStorage.getItem('token');
}
