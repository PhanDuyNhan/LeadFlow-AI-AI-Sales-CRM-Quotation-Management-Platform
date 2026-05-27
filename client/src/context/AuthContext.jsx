import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import api, { AUTH_TOKEN_KEY } from '../services/api';
import authService from '../services/auth.service';

const USER_STORAGE_KEY = 'leadflow.user';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [initializing, setInitializing] = useState(Boolean(localStorage.getItem(AUTH_TOKEN_KEY)));

  useEffect(() => {
    let cancelled = false;
    async function rehydrate() {
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const fresh = await authService.getMe();
        if (!cancelled) {
          setUser(fresh);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fresh));
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }
    rehydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((session) => {
    localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
    setToken(session.token);
    setUser(session.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common.Authorization;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      initializing,
      login,
      logout,
    }),
    [user, token, initializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
