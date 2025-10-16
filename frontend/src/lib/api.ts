import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Optionally handle 401 globally here
    return Promise.reject(error);
  }
);

export default api;
