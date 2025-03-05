// dependencies
import axios from "axios";

// store
import { AuthStore } from "@/globalStore";

const authUser = AuthStore.getState().authUser;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptors
api.interceptors.request.use((config) => {
  const token = authUser;
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
