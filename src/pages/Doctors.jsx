import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/doctors/doctor/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setDoctors(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">Shifokorlar</h2>
          <button
            onClick={() => navigate('/doctors/create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Yangi shifokor
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Yuklanmoqda...</p>
        ) : doctors.length === 0 ? (
          <p className="text-gray-500">Shifokorlar yo'q</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">#</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Mutaxassislik</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Daraja</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tajriba</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Telegram</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {doctors.map((doc, index) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{doc.user}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{doc.speciality}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{doc.rank_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{doc.experience_years} yil</td>
                    <td className="px-6 py-4 text-sm text-blue-500">
                      {doc.telegram_username ? (
                        <a href={`https://t.me/${doc.telegram_username}`} target="_blank">
                          @{doc.telegram_username}
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Doctors;