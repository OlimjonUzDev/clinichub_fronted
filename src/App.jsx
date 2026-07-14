import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import DoctorCreate from './pages/DoctorCreate';
import DoctorView from './pages/DoctorView';
import DoctorEdit from './pages/DoctorEdit';
import Patients from './pages/Patients';
import Specialities from './pages/Specialities';
import SpecialityCreate from './pages/SpecialityCreate';
import Clinics from './pages/Clinics';
import ClinicCreate from './pages/ClinicCreate';
import MedicalCenters from './pages/MedicalCenters';
import MedicalCenterCreate from './pages/MedicalCenterCreate';
import GettingStarted from './pages/GettingStarted';
import Ratings from './pages/Ratings';
import Appointments from './pages/Appointments';
import RankTypes from './pages/RankTypes';
import RankTypeCreate from './pages/RankTypeCreate';
import RankPrices from './pages/RankPrices';
import RankPriceCreate from './pages/RankPriceCreate';
import Invoices from './pages/Invoices';
import Payouts from './pages/Payouts';
import Users from './pages/Users';
import DoctorSettings from './pages/DoctorSettings';
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
        <Route path="/register" element={<Register />} />

        <Route path="/getting-started"    element={<Protected><GettingStarted /></Protected>} />
        <Route path="/dashboard"          element={<Protected><Dashboard /></Protected>} />

        {/* Doctors & Staff */}
        <Route path="/doctors"            element={<Protected><Doctors /></Protected>} />
        <Route path="/doctors/create"     element={<Protected><DoctorCreate /></Protected>} />
        <Route path="/doctors/:id"        element={<Protected><DoctorView /></Protected>} />
        <Route path="/doctors/:id/edit"   element={<Protected><DoctorEdit /></Protected>} />
        <Route path="/specialities"        element={<Protected><Specialities /></Protected>} />
        <Route path="/specialities/create" element={<Protected><SpecialityCreate /></Protected>} />
        <Route path="/ratings"            element={<Protected><Ratings /></Protected>} />

        {/* Clinics & Centers */}
        <Route path="/clinics"            element={<Protected><Clinics /></Protected>} />
        <Route path="/clinics/create"     element={<Protected><ClinicCreate /></Protected>} />
        <Route path="/medical-centers"        element={<Protected><MedicalCenters /></Protected>} />
        <Route path="/medical-centers/create" element={<Protected><MedicalCenterCreate /></Protected>} />

        {/* Patients & Encounters */}
        <Route path="/patients"           element={<Protected><Patients /></Protected>} />
        <Route path="/appointments"       element={<Protected><Appointments /></Protected>} />

        {/* Pricing & Ranks */}
        <Route path="/rank-types"         element={<Protected><RankTypes /></Protected>} />
        <Route path="/rank-types/create"  element={<Protected><RankTypeCreate /></Protected>} />
        <Route path="/rank-prices"        element={<Protected><RankPrices /></Protected>} />
        <Route path="/rank-prices/create" element={<Protected><RankPriceCreate /></Protected>} />

        {/* Integrations */}
        <Route path="/apps"               element={<Protected><Placeholder title="Apps" /></Protected>} />
        <Route path="/messages"           element={<Protected><Placeholder title="Messages" /></Protected>} />

        {/* Financial */}
        <Route path="/invoices"           element={<Protected><Invoices /></Protected>} />
        <Route path="/insurance"          element={<Protected><Placeholder title="Insurance Claims" /></Protected>} />
        <Route path="/payouts"            element={<Protected><Payouts /></Protected>} />
        <Route path="/doctor-settings"    element={<Protected><DoctorSettings /></Protected>} />

        {/* Admin */}
        <Route path="/users"              element={<Protected><Users /></Protected>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
