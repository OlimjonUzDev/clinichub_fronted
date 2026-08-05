import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Prescriptions from './pages/Prescriptions';
import Schedule from './pages/Schedule';
import Reviews from './pages/Reviews';
import Payouts from './pages/Payouts';
import Profile from './pages/Profile';

const Protected = ({ children }) => {
  const { token, role, roleLoading, logout } = useAuth();

  useEffect(() => {
    if (!roleLoading && role && role !== 'doctor') logout();
  }, [roleLoading, role, logout]);

  if (!token) return <Navigate to="/login" replace />;
  if (roleLoading) return null;
  if (role && role !== 'doctor') return <Navigate to="/login?blocked=1" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/appointments" element={<Protected><Appointments /></Protected>} />
        <Route path="/patients" element={<Protected><Patients /></Protected>} />
        <Route path="/prescriptions" element={<Protected><Prescriptions /></Protected>} />
        <Route path="/schedule" element={<Protected><Schedule /></Protected>} />
        <Route path="/reviews" element={<Protected><Reviews /></Protected>} />
        <Route path="/payouts" element={<Protected><Payouts /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
