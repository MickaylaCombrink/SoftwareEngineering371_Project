import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setTokens, clearTokens, getRefreshToken, setOnUnauthorized } from '../api/axios';

describe('token store helpers', () => {
  beforeEach(() => {
    clearTokens();
    setOnUnauthorized(null);
  });

  it('starts with no refresh token', () => {
    expect(getRefreshToken()).toBeNull();
  });

  it('stores tokens after setTokens', () => {
    setTokens('abc.access', 'xyz.refresh');
    expect(getRefreshToken()).toBe('xyz.refresh');
  });

  it('clears tokens after clearTokens', () => {
    setTokens('abc.access', 'xyz.refresh');
    clearTokens();
    expect(getRefreshToken()).toBeNull();
  });

  it('can register an unauthorized handler', () => {
    const cb = vi.fn();
    expect(() => setOnUnauthorized(cb)).not.toThrow();
    expect(cb).not.toHaveBeenCalled();
  });
});

describe('axios request interceptor attaches bearer token', () => {
  afterEach(() => {
    clearTokens();
  });

  it('adds an Authorization header when a token is set', async () => {
    setTokens('my-access-token', 'my-refresh-token');
    const api = (await import('../api/axios')).default;
    const config = { headers: {} };
    const handlers = api.interceptors.request.handlers;
    // Apply the request interceptor's fulfilled handler directly
    const result = handlers[0].fulfilled(config);
    expect(result.headers.Authorization).toBe('Bearer my-access-token');
  });

  it('leaves the config untouched when no token is set', async () => {
    clearTokens();
    const api = (await import('../api/axios')).default;
    const config = { headers: {} };
    const handlers = api.interceptors.request.handlers;
    const result = handlers[0].fulfilled(config);
    expect(result.headers.Authorization).toBeUndefined();
  });
});
