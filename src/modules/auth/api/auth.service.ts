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
    setAuthUser(response.data.data);
    localStorage.setItem("liu", JSON.stringify(response.data.data));
    localStorage.setItem("organisation_id", response.data.data.organisation_id);
    localStorage.setItem("id", response.data.data.id);
    localStorage.setItem("role", response.data.data.role);
    return response.data;
  },
  logout: async () => {
    setAuthUser(null);
    localStorage.removeItem("liu");
    localStorage.removeItem("organisation_id");
    localStorage.removeItem("id");
    localStorage.removeItem("role");
  },
};
