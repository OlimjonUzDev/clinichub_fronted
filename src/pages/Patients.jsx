import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/patients/patient/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setPatients(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">ClinicHub Admin</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Dashboard
        </button>
      </div>

      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-6">Bemorlar</h2>

        {loading ? (
          <p className="text-gray-500">Yuklanmoqda...</p>
        ) : patients.length === 0 ? (
          <p className="text-gray-500">Bemorlar yo'q</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">#</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">User</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tug'ilgan sana</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Manzil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patients.map((patient, index) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{patient.user}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{patient.birth_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{patient.address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;