import api from "@/utils/api/axios.config";
import { ProfileStore } from "@/modules/profile/store";

const { setIsChangingPassword } = ProfileStore.getState();

export const ProfileService = {
  // Change password for any authenticated user role
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      setIsChangingPassword(true);
      
      const payload = {
        current_password: currentPassword,
        new_password: newPassword,
      };

      // Use a generic user endpoint instead of client-specific endpoint
      const response = await api.put('/auth/change-password', payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data.data || response.data;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    } finally {
      setIsChangingPassword(false);
    }
  },

  // Get current user profile
  getCurrentUserProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data.data || response.data;
    } catch (error) {
      console.error("Get user profile error:", error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (profileData: Record<string, unknown>) => {
    try {
      const response = await api.put('/auth/profile', profileData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error("Update user profile error:", error);
      throw error;
    }
  },
};