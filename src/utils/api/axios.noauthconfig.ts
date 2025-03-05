// utils/api/authApi.config.ts
import axios from "axios";

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor (Handles Auth-Specific Errors)
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Auth API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default authApi;
