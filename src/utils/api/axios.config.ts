// dependencies
import axios from "axios";

// store
import { AuthStore } from "@/globalStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000, // Increased to 60 seconds for report generation
  // DO NOT set default Content-Type here - let axios set it based on request data
  // JSON requests will get application/json automatically
  // FormData requests will get multipart/form-data with boundary automatically
});

// Add interceptors
api.interceptors.request.use((config) => {
  const authUser = AuthStore.getState().authUser;

  const token = authUser.token;
  console.log("token in interceptor", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // handleApiError(error)
    console.error("Error", error);
  }
);

export default api;
