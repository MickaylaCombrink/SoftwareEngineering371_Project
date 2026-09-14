import { describe, test, expect, vi, beforeEach } from 'vitest';
import { buildUrl, ApiError, api, apiRequest, setOnAuthFailure } from './client';
import { tokenStorage } from './tokenStorage';

// fetch is replaced, so each response shape can be dictated exactly.

function jsonResponse(body, { status = 200, ok = status < 400 } = {}) {
  return { ok, status, text: async () => JSON.stringify(body) };
}

function emptyResponse({ status = 204 } = {}) {
  return { ok: status < 400, status, text: async () => '' };
}

beforeEach(() => {
  global.fetch = vi.fn();
  tokenStorage.clear();
  setOnAuthFailure(() => {});
});

describe('buildUrl', () => {
  test('adds the /api prefix when a caller omits it', () => {
    expect(buildUrl('/products')).toMatch(/\/api\/products$/);
  });

  test('does not double the prefix when a caller includes it', () => {
    // The bug this guards: base URL ending in /api plus a path starting with
    // /api produced /api/api/... and a 404 on every request.
    expect(buildUrl('/api/products')).toMatch(/\/api\/products$/);
    expect(buildUrl('/api/products')).not.toMatch(/\/api\/api/);
  });

  test('handles the bare /api path', () => {
    expect(buildUrl('/api')).toMatch(/\/api$/);
  });
});

describe('request handling', () => {
  test('unwraps data for a normal resource call', async () => {
    fetch.mockResolvedValue(jsonResponse({ status: 'success', data: { products: [1, 2] } }));

    await expect(api.get('/products')).resolves.toEqual({ products: [1, 2] });
  });

  test('keeps the envelope when the extras sit outside data', async () => {
    fetch.mockResolvedValue(
      jsonResponse({ status: 'success', data: { products: [] }, total: 41, pages: 5 })
    );

    const body = await api.rawGet('/products');

    expect(body.total).toBe(41);
    expect(body.pages).toBe(5);
  });

  test('attaches the bearer token when one is stored', async () => {
    tokenStorage.setTokens('access-123', 'refresh-123');
    fetch.mockResolvedValue(jsonResponse({ data: {} }));

    await api.get('/auth/me');

    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer access-123');
  });

  test('sends no Authorization header when signed out', async () => {
    fetch.mockResolvedValue(jsonResponse({ data: {} }));

    await api.get('/products');

    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  test('an empty body (204) resolves rather than throwing a parse error', async () => {
    fetch.mockResolvedValue(emptyResponse());

    await expect(api.delete('/products/p1')).resolves.toBeUndefined();
  });

  test('a non-JSON error page does not mask the status code', async () => {
    // A proxy timeout page is HTML, not JSON
    fetch.mockResolvedValue({ ok: false, status: 502, text: async () => '<html>gateway</html>' });

    await expect(api.get('/products')).rejects.toMatchObject({ status: 502 });
  });

  test("an error carries the server's own message", async () => {
    fetch.mockResolvedValue(
      jsonResponse({ status: 'fail', message: 'Only 2 units are available.' }, { status: 422 })
    );

    await expect(api.post('/orders')).rejects.toThrow('Only 2 units are available.');
  });

  test.each([
    ['put', 'PUT'],
    ['post', 'POST'],
    ['delete', 'DELETE'],
  ])('api.%s sends %s with a JSON body', async (method, verb) => {
    fetch.mockResolvedValue(jsonResponse({ data: {} }));

    await api[method]('/products/p1', { price: 10 });

    expect(fetch.mock.calls[0][1].method).toBe(verb);
    expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({ price: 10 }));
  });

  test.each([
    ['rawPut', 'PUT'],
    ['rawPost', 'POST'],
    ['rawDelete', 'DELETE'],
  ])('api.%s returns the whole envelope', async (method, verb) => {
    fetch.mockResolvedValue(jsonResponse({ status: 'success', data: {}, results: 7 }));

    const body = await api[method]('/products', { a: 1 });

    expect(fetch.mock.calls[0][1].method).toBe(verb);
    expect(body.results).toBe(7);
  });

  test('a call with no body sends no body at all', async () => {
    fetch.mockResolvedValue(jsonResponse({ data: {} }));

    await api.post('/orders');

    expect(fetch.mock.calls[0][1].body).toBeUndefined();
  });

  test('a thrown error is an ApiError carrying the status', async () => {
    fetch.mockResolvedValue(jsonResponse({ message: 'Not found' }, { status: 404 }));

    await expect(api.get('/products/nope')).rejects.toBeInstanceOf(ApiError);
  });
});

describe('refresh and retry', () => {
  test('a 401 triggers one refresh and one retry, then succeeds', async () => {
    tokenStorage.setTokens('stale', 'refresh-1');

    fetch
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ token: 'fresh', refreshToken: 'refresh-2' }))
      .mockResolvedValueOnce(jsonResponse({ data: { user: { email: 'a@b.c' } } }));

    await expect(api.get('/auth/me')).resolves.toEqual({ user: { email: 'a@b.c' } });

    expect(fetch).toHaveBeenCalledTimes(3);
    // Rotation only works if both tokens are replaced
    expect(tokenStorage.getAccess()).toBe('fresh');
    expect(tokenStorage.getRefresh()).toBe('refresh-2');
  });

  test('a failed refresh clears the session and notifies once', async () => {
    tokenStorage.setTokens('stale', 'refresh-1');
    const onFailure = vi.fn();
    setOnAuthFailure(onFailure);

    fetch
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ message: 'invalid refresh' }, { status: 401 }));

    await expect(api.get('/auth/me')).rejects.toBeInstanceOf(ApiError);

    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(tokenStorage.getAccess()).toBeNull();
  });

  test('it retries only once, never in a loop', async () => {
    tokenStorage.setTokens('stale', 'refresh-1');

    fetch
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ token: 'fresh', refreshToken: 'refresh-2' }))
      .mockResolvedValueOnce(jsonResponse({ message: 'still expired' }, { status: 401 }));

    await expect(api.get('/auth/me')).rejects.toBeInstanceOf(ApiError);

    // Original, refresh, retry — and nothing more
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  test('a non-401 failure is not retried', async () => {
    fetch.mockResolvedValue(jsonResponse({ message: 'server error' }, { status: 500 }));

    await expect(api.get('/products')).rejects.toBeInstanceOf(ApiError);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('authPost does not refresh, because a 401 there means a wrong password', async () => {
    fetch.mockResolvedValue(
      jsonResponse({ message: 'Incorrect email or password.' }, { status: 401 })
    );

    await expect(api.authPost('/auth/login', { email: 'a@b.c', password: 'x' })).rejects.toThrow(
      /Incorrect email or password/
    );

    // One call: no refresh attempt, no redirect to login mid-login
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('concurrent 401s share a single refresh rather than racing', async () => {
    tokenStorage.setTokens('stale', 'refresh-1');

    fetch.mockImplementation(async (url) => {
      if (String(url).includes('/auth/refresh')) {
        return jsonResponse({ token: 'fresh', refreshToken: 'refresh-2' });
      }
      return tokenStorage.getAccess() === 'fresh'
        ? jsonResponse({ data: { ok: true } })
        : jsonResponse({ message: 'expired' }, { status: 401 });
    });

    await Promise.all([apiRequest('/a'), apiRequest('/b'), apiRequest('/c')]);

    const refreshCalls = fetch.mock.calls.filter(([url]) => String(url).includes('/auth/refresh'));
    expect(refreshCalls).toHaveLength(1);
  });
});
