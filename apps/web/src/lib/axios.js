import axios from "axios";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const api = axios.create({
  baseURL: `${ VITE_BACKEND_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Optional: interceptors for auth or error logging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;
