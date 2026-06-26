import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const DoctorCreate = () => {
  const [specialities, setSpecialities] = useState([]);
  const [rankTypes, setRankTypes] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    user: '',
    speciality: '',
    rank_type: '',
    clinic: '',
    telegram_username: '',
    bio: '',
    experience_years: 0,
  });
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    api.get('/catalog/speciality/', { headers }).then(res => setSpecialities(res.data));
    api.get('/catalog/ranktyp/', { headers }).then(res => setRankTypes(res.data));
    api.get('/clinics/clinics/', { headers }).then(res => setClinics(res.data));
    api.get('/auth/users/', { headers }).then(res => setUsers(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doctors/doctor/', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/doctors');
    } catch (err) {
      alert('Xatolik yuz berdi!');
    }
  };

  return (
    <Layout>
      <div className="p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <span>Shifokorlar</span>
          <span>/</span>
          <span className="text-gray-600">Qo'shish</span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/doctors')}
            className="text-gray-400 hover:text-gray-600"
          >
            ←
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Yangi shifokor qo'shish</h2>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Foydalanuvchi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                * Foydalanuvchi
              </label>
              <select
                name="user"
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              >
                <option value="">Tanlang</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </div>

            {/* Mutaxassislik va Daraja */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  * Mutaxassislik
                </label>
                <select
                  name="speciality"
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                >
                  <option value="">Tanlang</option>
                  {specialities.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  * Daraja
                </label>
                <select
                  name="rank_type"
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                >
                  <option value="">Tanlang</option>
                  {rankTypes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Klinika */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                * Klinika
              </label>
              <select
                name="clinic"
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              >
                <option value="">Tanlang</option>
                {clinics.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Telegram va Tajriba */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram username
                </label>
                <input
                  type="text"
                  name="telegram_username"
                  onChange={handleChange}
                  placeholder="@username"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tajriba (yil)
                </label>
                <input
                  type="number"
                  name="experience_years"
                  onChange={handleChange}
                  defaultValue={0}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                onChange={handleChange}
                placeholder="Shifokor haqida qisqacha ma'lumot..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            {/* Tugmalar */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-medium text-sm transition"
              >
                Saqlash
              </button>
              <button
                type="button"
                onClick={() => navigate('/doctors')}
                className="border border-gray-200 text-gray-600 px-8 py-3 rounded-xl hover:bg-gray-50 font-medium text-sm transition"
              >
                Bekor qilish
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorCreate;