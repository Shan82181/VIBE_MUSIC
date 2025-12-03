import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:3000/api", // change if your backend differs
  baseURL: "https://vibe-music-backend-l1rk.onrender.com/api", // change if your backend differs
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
