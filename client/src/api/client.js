import { tokenStorage } from './tokenStorage';
import { messageForStatus } from '../utils/errorMessages';

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Normalise both spellings so /api/api/... can never be built
const ORIGIN = RAW_BASE_URL.replace(/\/+$/, '').replace(/\/api$/, '');

export function buildUrl(path) {
  const suffix = path.startsWith('/api/') || path === '/api' ? path : `/api${path}`;
  return `${ORIGIN}${suffix}`;
}

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

let refreshPromise = null; // dedupes concurrent refresh attempts

// Parses the body, falling back to null for non-JSON responses
async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Returns the full envelope, for endpoints whose fields sit outside `data`
async function rawRequestFull(path, options = {}) {
  const access = tokenStorage.getAccess();
  const res = await fetch(buildUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      ...options.headers,
    },
  });

  const body = await parseBody(res);

  if (!res.ok) {
    const serverMessage = body?.message;
    throw new ApiError(messageForStatus(res.status, serverMessage), res.status, body);
  }

  return body;
}

// Standard case: unwrap `data`
async function rawRequest(path, options = {}) {
  const body = await rawRequestFull(path, options);
  return body?.data;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = tokenStorage.getRefresh();
      const body = await rawRequestFull('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      // Overwriting both tokens is what makes rotation work
      tokenStorage.setTokens(body.token, body.refreshToken);
      return body.token;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Called when a session is beyond saving; AuthContext overrides this
let onAuthFailure = () => {
  window.location.assign('/login');
};

export function setOnAuthFailure(handler) {
  onAuthFailure = handler;
}

// A 401 triggers one refresh and one retry. Not used for login/register
async function withRefresh(attempt) {
  try {
    return await attempt();
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err;

    try {
      await refreshAccessToken();
    } catch {
      tokenStorage.clear();
      onAuthFailure();
      throw err;
    }

    return attempt(); // retry exactly once
  }
}

// Unwraps `data`
export function apiRequest(path, options = {}) {
  return withRefresh(() => rawRequest(path, options));
}

// Returns the whole envelope, refresh-aware
export function apiRequestFull(path, options = {}) {
  return withRefresh(() => rawRequestFull(path, options));
}

const json = (body) => (body === undefined ? {} : { body: JSON.stringify(body) });

export const api = {
  // Unwrapped: resolve straight to the `data` object
  get: (path) => apiRequest(path, { method: 'GET' }),
  post: (path, body) => apiRequest(path, { method: 'POST', ...json(body) }),
  put: (path, body) => apiRequest(path, { method: 'PUT', ...json(body) }),
  delete: (path, body) => apiRequest(path, { method: 'DELETE', ...json(body) }),

  // Full envelope, still refresh-aware
  rawGet: (path) => apiRequestFull(path, { method: 'GET' }),
  rawPost: (path, body) => apiRequestFull(path, { method: 'POST', ...json(body) }),
  rawPut: (path, body) => apiRequestFull(path, { method: 'PUT', ...json(body) }),
  rawDelete: (path, body) => apiRequestFull(path, { method: 'DELETE', ...json(body) }),

  // Login/register: a 401 is a bad password, so skip the refresh handling
  authPost: (path, body) => rawRequestFull(path, { method: 'POST', ...json(body) }),
};
