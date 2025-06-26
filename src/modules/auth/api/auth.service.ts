// api client
import api from "@/utils/api/axios.noauthconfig";

// payload types
import { LoginPayload } from "./auth.payload";

// store
import { AuthStore } from "@/globalStore";

const baseURL = "/auth";

const setAuthUser = AuthStore.getState().setAuthUser;

export const AuthService = {
  login: async (credentials: LoginPayload) => {
    const response = await api.post(`${baseURL}/login`, credentials);
    console.log(response);
    
    // Handle both response.data.data and response.data structures
    const userData = response.data.data || response.data;
    
    if (!userData) {
      throw new Error("Invalid response format: user data not found");
    }
    
    setAuthUser(userData);
    localStorage.setItem("liu", JSON.stringify(userData));
    
    // Safely set localStorage items with null checks
    if (userData.organisation_id) {
      localStorage.setItem("organisation_id", userData.organisation_id);
    }
    if (userData.id) {
      localStorage.setItem("id", userData.id);
    }
    if (userData.role) {
      localStorage.setItem("role", userData.role);
    }
    
    // Store additional user info for profile display
    if (userData.first_name) {
      localStorage.setItem("first_name", userData.first_name);
    }
    if (userData.last_name) {
      localStorage.setItem("last_name", userData.last_name);
    }
    if (userData.name) {
      localStorage.setItem("name", userData.name);
    }
    if (userData.email) {
      localStorage.setItem("email", userData.email);
    }
    if (userData.userId || userData.user_id) {
      localStorage.setItem("user_id", userData.userId || userData.user_id);
    }
    if (userData.username) {
      localStorage.setItem("username", userData.username);
    }
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
    
    return response.data;
  },
  logout: async () => {
    setAuthUser(null);
    localStorage.removeItem("liu");
    localStorage.removeItem("organisation_id");
    localStorage.removeItem("id");
    localStorage.removeItem("role");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
  },
};
