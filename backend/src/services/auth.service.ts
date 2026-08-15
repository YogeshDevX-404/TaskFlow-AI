import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUserDocument } from '../models/user.model';
import { config } from '../config/env.config';
import { EmailService } from './email.service';
import { AuthTokens, IUserPayload, TokenPayload } from '../types';
import { HTTP_STATUS } from '../constants';

export class CustomAuthError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = HTTP_STATUS.BAD_REQUEST, code: string = 'AUTH_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, CustomAuthError.prototype);
  }
}

export class AuthService {
  /**
   * Helper to sign JWT Access and Refresh Tokens
   */
  public static generateTokens(user: IUserDocument): AuthTokens {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Process user after successful social authentication
   */
  public static async handleSocialLogin(
    user: IUserDocument
  ): Promise<{ user: IUserPayload; tokens: AuthTokens }> {
    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      user: user.toUserPayload(),
      tokens,
    };
  }

  /**
   * Direct social authentication helper (for popup fallback / instant auth)
   */
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
  }): Promise<{ user: IUserPayload; tokens: AuthTokens }> {
    const { findOrCreateSocialUser } = await import('../config/passport.config');
    const user = await findOrCreateSocialUser({
      provider: data.provider,
      providerId: data.providerId || `${data.provider}_${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName || '',
      avatar: data.avatar || '',
      githubUsername: data.githubUsername,
      githubProfileUrl: data.githubProfileUrl,
      googleId: data.googleId,
    });

    return this.handleSocialLogin(user);
  }

  /**
   * Register a new user
   */
  public static async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<{ user: IUserPayload; tokens: AuthTokens }> {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new CustomAuthError('An account with this email address already exists.', HTTP_STATUS.CONFLICT, 'DUPLICATE_EMAIL');
    }

    const user = new User({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      password: data.password,
      isVerified: true, // auto-verify in local dev
    });

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Send Welcome Email
    (async () => {
      try {
        await EmailService.sendWelcomeEmail({
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
          userId: user._id.toString(),
        });
      } catch (err: any) {
        console.error(`[AuthService] Error sending welcome email: ${err.message}`);
      }
    })();

    return {
      user: user.toUserPayload(),
      tokens,
    };
  }

  /**
   * User login with email & password
   */
  public static async login(
    email: string,
    password: string
  ): Promise<{ user: IUserPayload; tokens: AuthTokens }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
    if (!user) {
      throw new CustomAuthError('Invalid email or password credentials.', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new CustomAuthError('Account is disabled. Please contact support.', HTTP_STATUS.FORBIDDEN, 'ACCOUNT_DISABLED');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new CustomAuthError('Invalid email or password credentials.', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
    }

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      user: user.toUserPayload(),
      tokens,
    };
  }

  /**
   * Refresh JWT Access Token
   */
  public static async refreshAccessToken(
    providedRefreshToken: string
  ): Promise<{ user: IUserPayload; tokens: AuthTokens }> {
    if (!providedRefreshToken) {
      throw new CustomAuthError('Refresh token is required.', HTTP_STATUS.UNAUTHORIZED, 'NO_REFRESH_TOKEN');
    }

    let decodedPayload: TokenPayload;
    try {
      decodedPayload = jwt.verify(providedRefreshToken, config.jwtRefreshSecret) as TokenPayload;
    } catch {
      throw new CustomAuthError('Invalid or expired refresh token.', HTTP_STATUS.UNAUTHORIZED, 'INVALID_REFRESH_TOKEN');
    }

    const user = await User.findById(decodedPayload.userId).select('+refreshToken');
    if (!user || !user.isActive || user.refreshToken !== providedRefreshToken) {
      throw new CustomAuthError('Refresh token revoked or user invalid.', HTTP_STATUS.UNAUTHORIZED, 'TOKEN_REVOKED');
    }

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: user.toUserPayload(),
      tokens,
    };
  }

  /**
   * Logout user and invalidate refresh token
   */
  public static async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  /**
   * Generate password reset token for forgot-password
   */
  public static async forgotPassword(email: string): Promise<{ resetToken: string }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success simulation for security
      return { resetToken: 'demo-reset-token-sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Trigger Password Reset Email
    (async () => {
      try {
        await EmailService.sendPasswordResetEmail({
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
          resetToken,
          recipientUserId: user._id.toString(),
        });
      } catch (err: any) {
        console.error(`[AuthService] Error sending password reset email: ${err.message}`);
      }
    })();

    return { resetToken };
  }

  /**
   * Reset password using reset token
   */
  public static async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      throw new CustomAuthError('Password reset token is invalid or has expired.', HTTP_STATUS.BAD_REQUEST, 'INVALID_RESET_TOKEN');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined;
    await user.save();
  }

  /**
   * Change password for logged-in user
   */
  public static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new CustomAuthError('User account not found.', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new CustomAuthError('Current password provided is incorrect.', HTTP_STATUS.BAD_REQUEST, 'INVALID_CURRENT_PASSWORD');
    }

    user.password = newPassword;
    user.refreshToken = undefined;
    await user.save();
  }

  /**
   * Fetch current authenticated user
   */
  public static async getMe(userId: string): Promise<IUserPayload> {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomAuthError('User not found.', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }
    return user.toUserPayload();
  }
}
