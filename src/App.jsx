import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import DoctorCreate from './pages/DoctorCreate';
import Patients from './pages/Patients';
import Specialities from './pages/Specialities';
import Clinics from './pages/Clinics';
import GettingStarted from './pages/GettingStarted';
import Placeholder from './pages/Placeholder';

const Protected = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/getting-started"    element={<Protected><GettingStarted /></Protected>} />
        <Route path="/dashboard"          element={<Protected><Dashboard /></Protected>} />

        {/* Doctors & Staff */}
        <Route path="/doctors"            element={<Protected><Doctors /></Protected>} />
        <Route path="/doctors/create"     element={<Protected><DoctorCreate /></Protected>} />
        <Route path="/specialities"       element={<Protected><Specialities /></Protected>} />
        <Route path="/ratings"            element={<Protected><Placeholder title="Ratings" /></Protected>} />

        {/* Clinics & Centers */}
        <Route path="/clinics"            element={<Protected><Clinics /></Protected>} />
        <Route path="/medical-centers"    element={<Protected><Placeholder title="Medical Centers" /></Protected>} />

        {/* Patients & Encounters */}
        <Route path="/patients"           element={<Protected><Patients /></Protected>} />
        <Route path="/appointments"       element={<Protected><Placeholder title="Appointments" /></Protected>} />

        {/* Pricing & Ranks */}
        <Route path="/rank-types"         element={<Protected><Placeholder title="Rank Types" /></Protected>} />
        <Route path="/rank-prices"        element={<Protected><Placeholder title="Rank Prices" /></Protected>} />

        {/* Other */}
        <Route path="/invoices"           element={<Protected><Placeholder title="Invoices" /></Protected>} />
        <Route path="/insurance"          element={<Protected><Placeholder title="Insurance Claims" /></Protected>} />
        <Route path="/payouts"            element={<Protected><Placeholder title="Doctor Payouts" /></Protected>} />
        <Route path="/doctor-settings"    element={<Protected><Placeholder title="Doctors Settings" /></Protected>} />
        <Route path="/coupons"            element={<Protected><Placeholder title="Coupons" /></Protected>} />
        <Route path="/banners"            element={<Protected><Placeholder title="Banners" /></Protected>} />
        <Route path="/users"              element={<Protected><Placeholder title="Users" /></Protected>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
