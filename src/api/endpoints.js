import { api } from './client';
import { tokenStorage } from './tokenStorage';

export const AuthAPI = {
  register: async (payload) => {
    const body = await api.rawPost('/api/auth/register', payload);
    tokenStorage.setTokens(body.token, body.refreshToken);
    return body.data.user;
  },

  login: async (email, password) => {
    const body = await api.rawPost('/api/auth/login', { email, password });
    tokenStorage.setTokens(body.token, body.refreshToken);
    return body.data.user;
  },

  logout: () =>
    api
      .post('/api/auth/logout', { refreshToken: tokenStorage.getRefresh() })
      .finally(() => tokenStorage.clear()),

  // Clean envelope shape — returns the user directly.
  getMe: () => api.get('/api/auth/me'),
};

// Add other resource groups here as their routes are confirmed, e.g.:
// export const UsersAPI = { list: () => api.get('/api/users'), ... };