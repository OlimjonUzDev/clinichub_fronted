import { createContext, useState, useContext, useEffect } from 'react';
import api, { fetchAll } from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [roleLoading, setRoleLoading] = useState(!!localStorage.getItem('access_token'));
  const [doctor, setDoctor] = useState(null);
  const [doctorFetched, setDoctorFetched] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get('/me/', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { setRole(res.data.role); setUserId(res.data.id); })
      .catch(() => { setRole(null); setUserId(null); })
      .finally(() => setRoleLoading(false));
  }, [token]);

  // There is no /doctors/doctor/me/ action on the backend, so the doctor's
  // own Doctor record is found by fetching the (small) doctor list and
  // matching on `user`. Every page that needs "my own doctor id" (Profile,
  // Schedule, Prescriptions, Appointments filters) reads it from here instead
  // of re-fetching the whole list itself. `doctorLoading` below is derived
  // (not its own state) so this effect never needs a synchronous early-return
  // setState call.
  useEffect(() => {
    if (!token || roleLoading || role !== 'doctor' || !userId) return;
    fetchAll('/doctors/doctor/', token)
      .then((list) => {
        const mine = list.find((d) => (typeof d.user === 'object' ? d.user.id : d.user) === userId);
        setDoctor(mine || null);
      })
      .catch(() => setDoctor(null))
      .finally(() => setDoctorFetched(true));
  }, [token, roleLoading, role, userId]);

  const doctorLoading = !!token && !roleLoading && role === 'doctor' && !doctorFetched;

  const login = (accessToken) => {
    localStorage.setItem('access_token', accessToken);
    // A fresh login (no reload) leaves roleLoading at its stale `false` from
    // before the token existed, so `Protected` would render the destination
    // page before the /me/ role check below resolves. Reset it here so the
    // gate blocks until role is confirmed again.
    setRoleLoading(true);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setRole(null);
    setUserId(null);
    setDoctor(null);
    setDoctorFetched(false);
  };

  const refreshDoctor = () => {
    if (!token) return;
    fetchAll('/doctors/doctor/', token)
      .then((list) => {
        const mine = list.find((d) => (typeof d.user === 'object' ? d.user.id : d.user) === userId);
        setDoctor(mine || null);
      })
      .catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, roleLoading, doctor, doctorLoading, refreshDoctor, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
