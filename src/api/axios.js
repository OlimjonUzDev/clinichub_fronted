import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
});

// Session died (token expired/invalid) mid-use: every page's requests would
// otherwise fail 401 and get silently swallowed by their own .catch(), leaving
// the user staring at an empty-looking screen with no idea why. Force them
// back to a clean login instead.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// The backend paginates list endpoints ({count, next, previous, results}).
// This follows every 'next' link and returns the full concatenated array,
// so pages can keep doing client-side search/pagination like before.
export async function fetchAll(url, token) {
  let items = [];
  let next = url;
  while (next) {
    const res = await api.get(next, { headers: { Authorization: `Bearer ${token}` } });
    const data = res.data;
    if (Array.isArray(data)) {
      items = items.concat(data);
      next = null;
    } else if (data && Array.isArray(data.results)) {
      items = items.concat(data.results);
      next = data.next;
    } else {
      next = null;
    }
  }
  return items;
}

export default api;