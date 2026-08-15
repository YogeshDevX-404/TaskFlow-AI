import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ActivityService } from '../services/activity.service';
import { OrganizationMember } from '../models/organizationMember.model';
import { sendSuccessResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { config } from '../config/env.config';
import { IUserDocument } from '../models/user.model';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: config.nodeEnv === 'production' ? ('none' as const) : ('lax' as const),
};

export class AuthController {
  public static async socialCallback(req: Request, res: Response): Promise<void> {
    const userDoc = req.user as unknown as IUserDocument;
    if (!userDoc) {
      res.send(`
        <!DOCTYPE html>
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_FAILURE', message: 'Social authentication failed.' }, '*');
                window.close();
              } else {
                window.location.href = '/?error=auth_failed';
              }
            </script>
            <p>Authentication failed. You may close this window.</p>
          </body>
        </html>
      `);
      return;
    }

    const { user, tokens } = await AuthService.handleSocialLogin(userDoc);

    res.cookie('accessToken', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Successful</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0f172a; color: #ffffff;">
          <script>
            const authData = {
              user: ${JSON.stringify(user)},
              tokens: ${JSON.stringify(tokens)}
            };
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', data: authData }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <div style="text-align: center;">
            <h2 style="margin-bottom: 8px;">Authentication Successful!</h2>
            <p style="color: #94a3b8; font-size: 14px;">Closing window and returning to TaskFlow AI...</p>
          </div>
        </body>
      </html>
    `);
  }

  public static async socialLoginDirect(req: Request, res: Response): Promise<Response> {
    const { user, tokens } = await AuthService.socialLoginDirect(req.body);

    res.cookie('accessToken', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      'Social authentication successful.',
      { user, tokens }
    );
  }

  public static async register(req: Request, res: Response): Promise<Response> {
    const { user, tokens } = await AuthService.register(req.body);

    res.cookie('accessToken', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccessResponse(
      res,
      HTTP_STATUS.CREATED,
      'User account registered successfully.',
      { user, tokens }
    );
  }

  public static async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    const { user, tokens } = await AuthService.login(email, password);

    res.cookie('accessToken', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Record login audit event
    try {
      const activeMember = await OrganizationMember.findOne({ user: user.id, status: 'active' });
      if (activeMember) {
        const ip = (req.headers['x-forwarded-for'] as string) || req.ip || null;
        const userAgent = req.headers['user-agent'] || null;
        ActivityService.recordActivity({
          organizationId: activeMember.organization.toString(),
          userId: user.id,
          action: 'login',
          entityType: 'Auth',
          entityId: user.id,
          ipAddress: ip,
          userAgent: userAgent,
          metadata: { userEmail: user.email, userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() },
        });
      }
    } catch (e) {
      // Ignore non-fatal audit log error
    }

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      'Authentication successful.',
      { user, tokens }
    );
  }

  public static async refresh(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    const { user, tokens } = await AuthService.refreshAccessToken(refreshToken);

    res.cookie('accessToken', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      'Access token refreshed successfully.',
      { user, tokens }
    );
  }

  public static async logout(req: Request, res: Response): Promise<Response> {
    if (req.user?.id) {
      try {
        const activeMember = await OrganizationMember.findOne({ user: req.user.id, status: 'active' });
        if (activeMember) {
          const ip = (req.headers['x-forwarded-for'] as string) || req.ip || null;
          const userAgent = req.headers['user-agent'] || null;
          ActivityService.recordActivity({
            organizationId: activeMember.organization.toString(),
            userId: req.user.id,
            action: 'logout',
            entityType: 'Auth',
            entityId: req.user.id,
            ipAddress: ip,
            userAgent: userAgent,
            metadata: { userEmail: req.user.email },
          });
        }
      } catch (e) {
        // Ignore
      }

      await AuthService.logout(req.user.id);
    }

    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      'Logged out successfully.'
    );
  }

  public static async forgotPassword(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;
    const { resetToken } = await AuthService.forgotPassword(email);

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      'If an account with that email exists, a password reset link has been dispatched.',
      { resetToken }
    );
  }

  public static async resetPassword(req: Request, res: Response): Promise<Response> {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      'Password reset successfully. You may now log in with your new credentials.'
    );
  }

  public static async changePassword(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    await AuthService.changePassword(userId, currentPassword, newPassword);

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      'Password changed successfully.'
    );
  }

  public static async getMe(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.id;
    const user = await AuthService.getMe(userId);

    return sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      'Current authenticated user profile retrieved.',
      { user }
    );
  }
}
