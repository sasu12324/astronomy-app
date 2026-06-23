import axios from 'axios';
import { auth } from '../config/firebase.js';

const api = axios.create({
  baseURL: 'https://astronomy-server.railway.app/api'
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
