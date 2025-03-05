import api from '../api/axios';
import { SignInWithEmailPassword } from '@/types';

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string; 
}

export const authService = {
  login: async (credentials: SignInWithEmailPassword): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      // Store token
      localStorage.setItem('access_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },
  
  getUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};