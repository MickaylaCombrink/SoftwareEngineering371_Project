import { createContext, useContext, useReducer, useEffect } from 'react';
import api, { setTokens, clearTokens, setOnUnauthorized } from '../api/axios';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, loading: false };
    case 'LOADED':
      return { ...state, user: action.payload, loading: false };
    case 'STOP_LOADING':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const { user, token, refreshToken } = JSON.parse(stored);
        setTokens(token, refreshToken);
        dispatch({ type: 'LOADED', payload: user });
      } catch {
        localStorage.removeItem('auth');
        dispatch({ type: 'STOP_LOADING' });
      }
    } else {
      dispatch({ type: 'STOP_LOADING' });
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      localStorage.removeItem('auth');
      clearTokens();
      dispatch({ type: 'LOGOUT' });
    });
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, refreshToken, data: { user } } = data;
    setTokens(token, refreshToken);
    localStorage.setItem('auth', JSON.stringify({ user, token, refreshToken }));
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    return data;
  };

  const register = async (body) => {
    const { data } = await api.post('/auth/register', body);
    const { token, refreshToken, data: { user } } = data;
    setTokens(token, refreshToken);
    localStorage.setItem('auth', JSON.stringify({ user, token, refreshToken }));
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    return data;
  };

  const logout = async () => {
    try {
      const stored = localStorage.getItem('auth');
      if (stored) {
        const { refreshToken } = JSON.parse(stored);
        await api.post('/auth/logout', { refreshToken });
      }
    } catch { /* ignore */ }
    clearTokens();
    localStorage.removeItem('auth');
    dispatch({ type: 'LOGOUT' });
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      const updated = data.data.user;
      const stored = localStorage.getItem('auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.user = updated;
        localStorage.setItem('auth', JSON.stringify(parsed));
      }
      dispatch({ type: 'LOGIN_SUCCESS', payload: updated });
    } catch { /* ignore */ }
  };

  const value = {
    ...state,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
