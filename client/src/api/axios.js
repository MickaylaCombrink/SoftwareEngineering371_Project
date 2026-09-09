import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

let accessToken = null;
let refreshTokenValue = null;
let onUnauthorized = null;

export function setTokens(access, refresh) {
  accessToken = access;
  refreshTokenValue = refresh;
}

export function getRefreshToken() {
  return refreshTokenValue;
}

export function clearTokens() {
  accessToken = null;
  refreshTokenValue = null;
}

export function setOnUnauthorized(cb) {
  onUnauthorized = cb;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && refreshTokenValue && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken: refreshTokenValue }
        );
        setTokens(data.token, data.refreshToken);
        original.headers.Authorization = `Bearer ${data.token}`;
        return api(original);
      } catch {
        clearTokens();
        if (onUnauthorized) onUnauthorized();
      }
    }
    return Promise.reject(err);
  }
);

export default api;
