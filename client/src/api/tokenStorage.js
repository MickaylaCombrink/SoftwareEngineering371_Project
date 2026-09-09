// `access` maps to the `token` field the API returns.
// `refresh` maps to the `refreshToken` field, and gets overwritten on every
// login/register/refresh call because the backend rotates it — the old
// refresh token is deleted from the server's allow-list the instant a new
// one is issued, so failing to overwrite it here means the *next* refresh
// attempt will 401 with "Invalid or expired refresh token."

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};