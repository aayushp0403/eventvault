import axios from "axios";

const api = axios.create({ baseURL: "" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ev_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Only auto-redirect on 401 if we're NOT on an auth endpoint
    const url = err.config?.url || "";
    const isAuthCall = url.includes("/auth/login") || url.includes("/auth/register");

    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem("ev_token");
      localStorage.removeItem("ev_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;