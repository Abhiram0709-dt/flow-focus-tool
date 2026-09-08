import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
console.log("=== API CLIENT ===");
console.log("VITE_API_URL from env:", import.meta.env.VITE_API_URL);
console.log("Final baseURL:", baseURL);
console.log("==================");

export const apiClient = axios.create({
  baseURL,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized) - but not for the login/signup requests
// themselves, since a wrong password there is an expected, recoverable error
// the caller shows as a toast, not a sign of a stale session to force-logout.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/signup"];

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) =>
      error.config?.url?.endsWith(path)
    );
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

