import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(!!localStorage.getItem('access_token'));

  // Requires a GET /me/ endpoint (IsAuthenticated) returning at least {role: ...}
  // for the current user - not yet added on the backend, see TASKS.md.
  // logout() resets role/roleLoading directly, so this effect only needs to
  // handle the "a token showed up" case.
  useEffect(() => {
    if (!token) return;
    api.get('/me/', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setRole(res.data.role))
      .catch(() => setRole(null))
      .finally(() => setRoleLoading(false));
  }, [token]);

  const login = (accessToken) => {
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, roleLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
