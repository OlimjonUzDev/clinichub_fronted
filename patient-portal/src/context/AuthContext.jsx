import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [roleLoading, setRoleLoading] = useState(!!localStorage.getItem('access_token'));

  // Requires a GET /me/ endpoint (IsAuthenticated) returning at least {role: ...}
  // for the current user - not yet added on the backend, see TASKS.md.
  // logout() resets role/roleLoading directly, so this effect only needs to
  // handle the "a token showed up" case.
  useEffect(() => {
    if (!token) return;
    api.get('/me/', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { setRole(res.data.role); setUserId(res.data.id); })
      .catch(() => { setRole(null); setUserId(null); })
      .finally(() => setRoleLoading(false));
  }, [token]);

  const login = (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    // A fresh login (no reload) leaves roleLoading at its stale `false` from
    // before the token existed, so `Protected` would render the destination
    // page before the /me/ role check below resolves. Reset it here so the
    // gate blocks until role is confirmed again.
    setRoleLoading(true);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, roleLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
