import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/doctors', label: 'Shifokorlar', icon: '👨‍⚕️' },
  { path: '/clinics', label: 'Klinikalar', icon: '🏥' },
  { path: '/patients', label: 'Bemorlar', icon: '👥' },
  { path: '/appointments', label: 'Uchrashuvlar', icon: '📅' },
  { path: '/pricing', label: 'Narxlar', icon: '💰' },
  { path: '/notifications', label: 'SMS Shablonlar', icon: '💬' },
  { path: '/invoices', label: 'Invoices', icon: '🧾' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 min-h-screen bg-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-blue-600">🏥 ClinicHub</h1>
        <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
              ${location.pathname === item.path
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <span>🚪</span>
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;