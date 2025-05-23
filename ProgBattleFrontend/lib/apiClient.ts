// lib/axiosClient.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // your FastAPI base URL
  withCredentials: true,           // ✅ enable cookies
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized. You might need to log in.');
      // Optionally redirect or notify user
    }
    return Promise.reject(error);
  }
);

export default api;
