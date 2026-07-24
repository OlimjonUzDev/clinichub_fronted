import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import DoctorProfile from './pages/DoctorProfile';
import MyAppointments from './pages/MyAppointments';
import Profile from './pages/Profile';
import Prescriptions from './pages/Prescriptions';
import Reviews from './pages/Reviews';
import Payments from './pages/Payments';

// Non-patient roles (admin/doctor) are only known once GET /me/ resolves -
// while that backend endpoint is missing, `role` stays null and this never blocks.
const Protected = ({ children }) => {
  const { token, role, roleLoading, logout } = useAuth();

  useEffect(() => {
    if (!roleLoading && role && role !== 'patient') logout();
  }, [roleLoading, role, logout]);

  if (!token) return <Navigate to="/login" replace />;
  if (roleLoading) return null;
  if (role && role !== 'patient') return <Navigate to="/login?blocked=1" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Protected><Home /></Protected>} />
        <Route path="/doctor/:id" element={<Protected><DoctorProfile /></Protected>} />
        <Route path="/appointments" element={<Protected><MyAppointments /></Protected>} />
        <Route path="/prescriptions" element={<Protected><Prescriptions /></Protected>} />
        <Route path="/reviews" element={<Protected><Reviews /></Protected>} />
        <Route path="/payments" element={<Protected><Payments /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
