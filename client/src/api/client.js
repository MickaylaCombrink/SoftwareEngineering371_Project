import { tokenStorage } from './tokenStorage';
import { messageForStatus } from '../utils/errorMessages';

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// The env var may or may not already end in /api, and a caller may or may not
// prefix a path with /api. Normalising both here means neither spelling can
// produce the /api/api/... 404 that the two conventions otherwise collide into.
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

/**
 * Parses the response body safely. Some non-JSON responses are possible
 * upstream of Express (e.g. a proxy timeout page), so if parsing fails we
 * fall back to null rather than throwing a confusing parse error.
 */
async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Returns the FULL parsed body after checking res.ok. Needed for auth
 * endpoints, where `token`/`refreshToken` live outside `data`.
 *
 * Confirmed against errorHandler.js and rateLimiter.js: every error response
 * — operational or not, dev or prod, including both rate limiters — is
 * shaped { status, message }, so body?.message is a safe, permanent read.
 */
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

// Standard case: unwrap `data` for normal resource endpoints (getMe, users, etc.)
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
      // token/refreshToken are top-level on this endpoint, not under `data`.
      // Overwriting BOTH here is what makes rotation work.
      tokenStorage.setTokens(body.token, body.refreshToken);
      return body.token;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// What to do when a session is beyond saving. Person 2 can replace this with
// their auth context so the app clears state and navigates in-app instead of
// doing a full page load.
let onAuthFailure = () => {
  window.location.assign('/login');
};

export function setOnAuthFailure(handler) {
  onAuthFailure = handler;
}

// Wraps a request so a 401 triggers one refresh and one retry. Used for every
// authenticated call. NOT used for login/register, where a 401 means "wrong
// password" and refreshing would be both pointless and confusing.
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

// Returns the whole envelope, for endpoints whose extras (token, refreshToken,
// results/total/page/pages, itemCount/subtotal) live outside `data`
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

  // Login and register: a 401 here is a bad password, not an expired session,
  // so this path deliberately skips the refresh-and-redirect handling
  authPost: (path, body) => rawRequestFull(path, { method: 'POST', ...json(body) }),
};
