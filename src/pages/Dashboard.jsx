import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const chartData = [
    { name: 'Shifokorlar', soni: stats?.total_doctors || 0 },
    { name: 'Bemorlar', soni: stats?.total_patients || 0 },
    { name: 'Uchrashuvlar', soni: stats?.total_appointments || 0 },
  ];

  useEffect(() => {
    api.get('/dashboard/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setStats(res.data))
      .catch(() => {
        logout();
        navigate('/login');
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">ClinicHub Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
        >
          Chiqish
        </button>
      </div>

      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-6">Dashboard</h2>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div
            onClick={() => navigate('/doctors')}
            className="bg-white rounded-xl shadow p-6 text-center cursor-pointer hover:shadow-md transition"
          >
            <p className="text-gray-500 text-sm mb-2">Jami Shifokorlar</p>
            <p className="text-4xl font-bold text-blue-600">
              {stats?.total_doctors ?? '...'}
            </p>
          </div>

          <div
            onClick={() => navigate('/patients')}
            className="bg-white rounded-xl shadow p-6 text-center cursor-pointer hover:shadow-md transition"
          >
            <p className="text-gray-500 text-sm mb-2">Jami Bemorlar</p>
            <p className="text-4xl font-bold text-green-600">
              {stats?.total_patients ?? '...'}
            </p>
          </div>

          <div
            onClick={() => navigate('/appointments')}
            className="bg-white rounded-xl shadow p-6 text-center cursor-pointer hover:shadow-md transition"
          >
            <p className="text-gray-500 text-sm mb-2">Jami Uchrashuvlar</p>
            <p className="text-4xl font-bold text-purple-600">
              {stats?.total_appointments ?? '...'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Umumiy statistika</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="soni" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;