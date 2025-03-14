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
    return response.data;
  },
};
