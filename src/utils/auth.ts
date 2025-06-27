import { User } from '../types';
import { api } from './api';

const STORAGE_KEY = 'tvws_auth_token';
const USER_KEY = 'tvws_user';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      const user = await api.login(email, password);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  },

  logout: () => {
    api.logout();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) return null;

    try {
      const user = await api.getCurrentUser();
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      this.logout();
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEY);
  }
};