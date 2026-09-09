import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as authen from '.../api/authen';

const AuthContext = createContext(undefined);

export function AuthPovider ({ children}) {
    const [user, setUser] =useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] =useState(null);
    const [status, setStatus] =useState('loading');
}

useEffect(() =>{
let cancelled =  false;
 async function  restore() {
    if(!accessToken) {
        if (!cancelled) setStatus ('Not authenticated');
        return
    }
    try {
        const {user} = await authen.getMe(accessToken);
        if (!cancelled) {
            setUser(user);
            setStatus('Not authenticated')
        }
    }
    catch {
        if (!cancelled){
            setUser(null);
             setAccessToken(null);
          setRefreshToken(null);
          setStatus('Not authenticated');
        }
            
    }
 }


 restore ();
 return () =>{cancelled =  true;};
},[]
);

 const register = useCallback(async (email, password) => {
    const result = await authen.register({ email, password });
    setUser(result.user);
    setAccessToken(result.accessToken);
    setRefreshToken(result.refreshToken);
    setStatus('authenticated');
  }, []
);

const login = useCallback(async (email, password) => {
    try {
      const result = await authen.login({ email, password });
      setUser(result.user);
      setAccessToken(result.accessToken);
      setRefreshToken(result.refreshToken);
      setStatus('authenticated');
    } 
    catch (err) {
      if (err.status === 429) {
        throw new Error(err.message || 'Too many login attempts made. Try again in 15 minutes.');
      }
      throw new Error(err.message || 'email or password is Incorrect.');
    }
  }, []
);

const logout = useCallback(async () => {
    try {
    
      if (refreshToken) {
        await authen.logout(refreshToken);
      }
    } 
    catch (err) {
      console.error('Logout request failed, clearing local session:', err);
    } 
    finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setStatus('unauthenticated');
    }
  }, [refreshToken]
);

const value = {
    user, 
    accessToken,
    status,
    isAuthenticated: status === 'Authenticated',
    isAdmin: user?.role === 'admin',
    register,
    login,
    logout,
};

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}