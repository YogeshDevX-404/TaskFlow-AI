import { create } from 'zustand';
import { AuthService } from '../services/api/authService';
import {
  User,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
} from '../types/auth';
import { formatApiError } from '../utils/apiErrorHandler';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  socialLoginDirect: (data: {
    provider: 'github' | 'google';
    email: string;
    firstName: string;
    lastName?: string;
    avatar?: string;
    githubUsername?: string;
    githubProfileUrl?: string;
    googleId?: string;
    providerId?: string;
  }) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<string | null>;
  resetPassword: (data: ResetPasswordData) => Promise<boolean>;
  changePassword: (data: ChangePasswordData) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('taskflow_auth_token'),
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem('taskflow_auth_token', token);
    set({
      user,
      token,
      isAuthenticated: true,
      error: null,
    });
  },

  clearAuth: () => {
    localStorage.removeItem('taskflow_auth_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.login(credentials);
      if (response.data) {
        get().setAuth(response.data.user, response.data.tokens.accessToken);
        set({ isLoading: false });
        return true;
      }
      throw new Error(response.message || 'Login failed.');
    } catch (err) {
      const errorMsg = formatApiError(err);
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  socialLoginDirect: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.socialLoginDirect(data);
      if (response.data) {
        get().setAuth(response.data.user, response.data.tokens.accessToken);
        set({ isLoading: false });
        return true;
      }
      throw new Error(response.message || 'Social authentication failed.');
    } catch (err) {
      const errorMsg = formatApiError(err);
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.register(data);
      if (response.data) {
        get().setAuth(response.data.user, response.data.tokens.accessToken);
        set({ isLoading: false });
        return true;
      }
      throw new Error(response.message || 'Registration failed.');
    } catch (err) {
      const errorMsg = formatApiError(err);
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AuthService.logout();
    } catch (err) {
      console.warn('Logout server request failed:', err);
    } finally {
      get().clearAuth();
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isInitializing: true });
    const existingToken = localStorage.getItem('taskflow_auth_token');

    try {
      const response = await AuthService.getMe();
      if (response.data?.user) {
        set({
          user: response.data.user,
          token: existingToken,
          isAuthenticated: true,
          isInitializing: false,
        });
        return;
      }
      throw new Error('User check failed');
    } catch {
      get().clearAuth();
      set({ isInitializing: false });
    }
  },

  forgotPassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.forgotPassword(data);
      set({ isLoading: false });
      return response.data?.resetToken || 'reset-token-sent';
    } catch (err) {
      const errorMsg = formatApiError(err);
      set({ error: errorMsg, isLoading: false });
      return null;
    }
  },

  resetPassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.resetPassword(data);
      set({ isLoading: false });
      return true;
    } catch (err) {
      const errorMsg = formatApiError(err);
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  changePassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.changePassword(data);
      set({ isLoading: false });
      return true;
    } catch (err) {
      const errorMsg = formatApiError(err);
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
