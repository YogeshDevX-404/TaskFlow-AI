import { BaseApiService } from './baseApiService';
import {
  AuthResponseData,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  User,
} from '../../types/auth';

export class AuthService extends BaseApiService {
  public static async register(data: RegisterData) {
    return this.post<AuthResponseData>('/auth/register', data);
  }

  public static async login(credentials: LoginCredentials) {
    return this.post<AuthResponseData>('/auth/login', credentials);
  }

  public static async socialLoginDirect(data: {
    provider: 'github' | 'google';
    email: string;
    firstName: string;
    lastName?: string;
    avatar?: string;
    githubUsername?: string;
    githubProfileUrl?: string;
    googleId?: string;
    providerId?: string;
  }) {
    return this.post<AuthResponseData>('/auth/social-login', data);
  }

  public static async logout() {
    return this.post<void>('/auth/logout');
  }

  public static async refreshToken() {
    return this.post<AuthResponseData>('/auth/refresh');
  }

  public static async forgotPassword(data: ForgotPasswordData) {
    return this.post<{ resetToken: string }>('/auth/forgot-password', data);
  }

  public static async resetPassword(data: ResetPasswordData) {
    return this.post<void>('/auth/reset-password', data);
  }

  public static async changePassword(data: ChangePasswordData) {
    return this.put<void>('/auth/change-password', data);
  }

  public static async getMe() {
    return this.get<{ user: User }>('/auth/me');
  }
}
