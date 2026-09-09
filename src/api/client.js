import { tokenStorage } from './tokenStorage';
import { messageForStatus } from '../utils/errorMessages';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const res = await fetch(`${BASE_URL}${path}`, {
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

export async function apiRequest(path, options = {}) {
  try {
    return await rawRequest(path, options);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      try {
        await refreshAccessToken();
        return await rawRequest(path, options); // retry exactly once
      } catch {
        tokenStorage.clear();
        window.location.assign('/login');
        throw err;
      }
    }
    throw err;
  }
}

export const api = {
  get: (path) => apiRequest(path, { method: 'GET' }),
  post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
  // For endpoints where the caller needs fields outside `data` (login/register).
  rawPost: (path, body) => rawRequestFull(path, { method: 'POST', body: JSON.stringify(body) }),
};