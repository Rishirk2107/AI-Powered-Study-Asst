import axios from 'axios';

const DEFAULT_BASE = 'http://localhost:5000/api';
const baseURL = (typeof process !== 'undefined' && (process.env.REACT_APP_API_URL || process.env.VITE_API_URL)) || DEFAULT_BASE;

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }
  return config;
}, (error) => Promise.reject(error));

export const apiGet = (endpoint, params) => api.get(endpoint, { params }).then(res => res.data);
export const apiPost = (endpoint, data, config) => api.post(endpoint, data, config).then(res => res.data);
export const apiPut = (endpoint, data, config) => api.put(endpoint, data, config).then(res => res.data);
export const apiDelete = (endpoint, config) => api.delete(endpoint, config).then(res => res.data);

export const apiUpload = async (endpoint, formData) => {
  const response = await api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const generateAISchedule = (userMessage) => apiPost('/schedule/generate', { userMessage });
export const getSchedule = () => apiGet('/schedule');
export const saveSchedule = (schedule) => apiPost('/schedule/save', { schedule });

export default api;