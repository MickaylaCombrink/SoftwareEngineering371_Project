import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthAPI } from '../api/endpoints';
import { tokenStorage } from '../api/tokenStorage';
import { setOnAuthFailure } from '../api/client';

const AuthContext = createContext(null);

// status is always one of 'loading' | 'authenticated' | 'unauthenticated'
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  // Restore the session, verifying the stored token against /api/auth/me
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!tokenStorage.getAccess()) {
        if (!cancelled) setStatus('unauthenticated');
        return;
      }
      try {
        const me = await AuthAPI.getMe();
        if (!cancelled) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) clearSession();
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // Clear state in-app when the API client gives up on the session
  useEffect(() => {
    setOnAuthFailure(() => {
      setUser(null);
      setStatus('unauthenticated');
    });
  }, []);

  const register = useCallback(async (payload) => {
    const created = await AuthAPI.register(payload);
    setUser(created);
    setStatus('authenticated');
    return created;
  }, []);

  const login = useCallback(async (email, password) => {
    const signedIn = await AuthAPI.login(email, password);
    setUser(signedIn);
    setStatus('authenticated');
    return signedIn;
  }, []);

  const logout = useCallback(async () => {
    // AuthAPI.logout clears local tokens even if the server call fails
    await AuthAPI.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isAdmin: user?.role === 'admin',
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
