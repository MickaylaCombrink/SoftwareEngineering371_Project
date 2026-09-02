// Thin wrapper around the backend API
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(payload.message || `Request failed (${res.status})`);
  }

  return payload;
}

export const api = {
  health: () => request('/health'),
  getProducts: () => request('/products'),
  getCategories: () => request('/categories'),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  getCart: () => request('/cart'),
};
