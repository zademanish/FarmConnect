import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log the user out automatically when the token expires
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("fc_token")) {
      localStorage.removeItem("fc_token");
      localStorage.removeItem("fc_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Every API error surfaces as a readable message for toasts
export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong. Please try again.";

// Turns "/uploads/products/x.jpg" into a full URL the browser can load
export const imageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_SERVER_URL || "http://localhost:5000"}${path}`;
};

export default api;
