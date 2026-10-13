import axios from "axios";

// Single reusable Axios client - never hardcode API URLs elsewhere in the app.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("voiceshop_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response handling - auto logout on token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("voiceshop_token");
      localStorage.removeItem("voiceshop_user");
    }
    return Promise.reject(error);
  }
);

export default api;
