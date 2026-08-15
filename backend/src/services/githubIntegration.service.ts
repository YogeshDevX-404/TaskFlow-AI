import crypto from 'crypto';
import { Types } from 'mongoose';
import { config } from '../config/env.config';
import { OAuthStateModel } from '../models/oauthState.model';
import { GitHubConnectionModel, IGitHubConnectionPayload } from '../models/githubConnection.model';
import { User } from '../models/user.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { encryptToken, decryptToken } from '../utils/encryption.util';
import { GitHubApiService, IGitHubUserProfile } from './githubApi.service';
import { MockGitHubProvider } from './mockGithub.provider';
import { ActivityService } from './activity.service';
import { notificationService } from './notification.service';
import { NotificationType } from '../models/notification.model';

export class GitHubIntegrationService {
  /**
   * Creates a secure OAuth authorization URL with a short-lived state parameter
   */
  public static async createOAuthUrl(
    userId: string,
    redirectUri?: string
  ): Promise<{ url: string; state: string }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID provided for GitHub OAuth authorization');
    }

    // Generate cryptographically secure random state parameter
    const state = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes TTL

    // Store state bound to user
    await OAuthStateModel.create({
      state,
      userId: new Types.ObjectId(userId),
      redirectUri: redirectUri || config.githubCallbackUrl,
      used: false,
      expiresAt,
    });

    // In development mock mode, direct the authorization flow to the mock callback
    if (config.githubMockMode) {
      const mockCallbackUrl = `${config.githubCallbackUrl}?code=mock_dev_code_${Date.now()}&state=${state}`;
      return { url: mockCallbackUrl, state };
    }

    if (!config.githubClientId || !config.githubClientSecret) {
      throw new Error('GitHub Client ID or Secret is not configured. Set GITHUB_MOCK_MODE=true in environment to run in mock mode.');
    }

    const callbackUrl = config.githubCallbackUrl;
    const scope = encodeURIComponent('read:user user:email repo');

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${config.githubClientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${scope}&state=${state}`;

    return { url: authUrl, state };
  }

  /**
   * Processes OAuth callback from GitHub, validates state, retrieves token & user profile
   */
  public static async handleOAuthCallback(
    code: string,
    state: string,
    requestMeta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ connection: IGitHubConnectionPayload; userId: string }> {
    if (!state || !code) {
      throw new Error('Missing authorization code or state parameter from GitHub callback');
    }

    // 1. Validate state parameter
    const stateDoc = await OAuthStateModel.findOne({ state });

    if (!stateDoc || stateDoc.used || stateDoc.expiresAt < new Date()) {
      if (stateDoc) {
        stateDoc.used = true;
        await stateDoc.save().catch(() => {});
      }
      throw new Error('Invalid, expired, or previously used OAuth state parameter. Potential CSRF attempt detected.');
    }

    // Invalidate state immediately to prevent replay attacks
    stateDoc.used = true;
    await stateDoc.save();

    const userIdStr = stateDoc.userId.toString();

    try {
      let tokenResponse;
      let ghProfile;

      if (config.githubMockMode || code.startsWith('mock_')) {
        tokenResponse = await MockGitHubProvider.exchangeCodeForToken(code, state);
        ghProfile = await MockGitHubProvider.fetchUserProfile(tokenResponse.access_token);
      } else {
        tokenResponse = await GitHubApiService.exchangeCodeForToken(code, state);
        ghProfile = await GitHubApiService.fetchGitHubUserProfile(tokenResponse.access_token);
      }

      // 4. Encrypt token server-side before storing
      const encryptedToken = encryptToken(tokenResponse.access_token);

      // 5. Check if another user is already connected to this GitHub account ID
      const existingOtherUserConnection = await GitHubConnectionModel.findOne({
        githubUserId: String(ghProfile.id),
        user: { $ne: stateDoc.userId },
        status: 'Connected',
      });

      if (existingOtherUserConnection) {
        throw new Error(`GitHub account @${ghProfile.login} is already linked to a different TaskFlow AI account.`);
      }

      // 6. Upsert connection record for this user
      const now = new Date();
      let connection = await GitHubConnectionModel.findOne({ user: stateDoc.userId });

      if (connection) {
        connection.githubUserId = String(ghProfile.id);
        connection.githubUsername = ghProfile.login;
        connection.githubName = ghProfile.name || ghProfile.login;
        connection.githubAvatarUrl = ghProfile.avatar_url;
        connection.githubProfileUrl = ghProfile.html_url;
        connection.githubEmail = ghProfile.email || '';
        connection.accessTokenEncrypted = encryptedToken;
        connection.scope = tokenResponse.scope || 'read:user user:email repo';
        connection.status = 'Connected';
        connection.connectedAt = now;
        connection.lastSyncedAt = now;
        await connection.save();
      } else {
        connection = await GitHubConnectionModel.create({
          user: stateDoc.userId,
          githubUserId: String(ghProfile.id),
          githubUsername: ghProfile.login,
          githubName: ghProfile.name || ghProfile.login,
          githubAvatarUrl: ghProfile.avatar_url,
          githubProfileUrl: ghProfile.html_url,
          githubEmail: ghProfile.email || '',
          accessTokenEncrypted: encryptedToken,
          scope: tokenResponse.scope || 'read:user user:email repo',
          status: 'Connected',
          connectedAt: now,
          lastSyncedAt: now,
        });
      }

      // 7. Sync User document fields
      await User.findByIdAndUpdate(stateDoc.userId, {
        githubUsername: ghProfile.login,
        githubProfileUrl: ghProfile.html_url,
      });

      // 8. Record audit log & notification
      const activeMember = await OrganizationMember.findOne({ user: stateDoc.userId, status: 'active' });
      const orgId = activeMember ? activeMember.organization.toString() : null;

      if (orgId) {
        await ActivityService.recordActivity({
          organizationId: orgId,
          userId: userIdStr,
          action: 'github.connected',
          entityType: 'Integration',
          entityId: connection._id.toString(),
          metadata: {
            githubUsername: ghProfile.login,
            githubUserId: String(ghProfile.id),
            githubName: ghProfile.name,
            provider: 'github',
          },
          ipAddress: requestMeta?.ipAddress || null,
          userAgent: requestMeta?.userAgent || null,
        });
      }

      await notificationService.createNotification({
        recipient: userIdStr,
        type: 'System Announcement' as NotificationType,
        title: 'GitHub Integration Connected',
        message: `Your TaskFlow AI account has been successfully connected to GitHub (@${ghProfile.login}).`,
        priority: 'Normal',
        data: { githubUsername: ghProfile.login },
      });

      return {
        connection: connection.toPayload(),
        userId: userIdStr,
      };
    } catch (err: any) {
      // Record failure if connection attempt failed
      const activeMember = await OrganizationMember.findOne({ user: stateDoc.userId, status: 'active' });
      if (activeMember) {
        await ActivityService.recordActivity({
          organizationId: activeMember.organization.toString(),
          userId: userIdStr,
          action: 'github.connection_failed',
          entityType: 'Integration',
          entityId: userIdStr,
          metadata: { error: err.message || 'Connection failed' },
          ipAddress: requestMeta?.ipAddress || null,
          userAgent: requestMeta?.userAgent || null,
        });
      }
      throw err;
    }
  }

  /**
   * Retrieves connection status for a user (safe fields only, no tokens)
   */
  public static async getConnectionStatus(
    userId: string
  ): Promise<{ connected: boolean; connection: IGitHubConnectionPayload | null }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID provided');
    }

    const connection = await GitHubConnectionModel.findOne({
      user: userId,
      status: 'Connected',
    });

    if (!connection) {
      return { connected: false, connection: null };
    }

    return {
      connected: true,
      connection: connection.toPayload(),
    };
  }

  /**
   * Retrieves the connected GitHub user profile
   */
  public static async getGitHubProfile(userId: string): Promise<IGitHubUserProfile> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID provided');
    }

    const connection = await GitHubConnectionModel.findOne({
      user: userId,
      status: 'Connected',
    }).select('+accessTokenEncrypted');

    if (!connection) {
      throw new Error('No active GitHub connection found for this user account.');
    }

    const decryptedToken = decryptToken(connection.accessTokenEncrypted);
    let profile: IGitHubUserProfile;

    if (config.githubMockMode || decryptedToken.startsWith('mock_')) {
      profile = await MockGitHubProvider.fetchUserProfile(decryptedToken);
    } else {
      profile = await GitHubApiService.fetchGitHubUserProfile(decryptedToken);
    }

    // Update lastSyncedAt timestamp
    connection.lastSyncedAt = new Date();
    await connection.save();

    return profile;
  }

  /**
   * Disconnects GitHub account for a user securely
   */
  public static async disconnectGitHub(
    userId: string,
    requestMeta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ success: boolean; message: string }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID provided');
    }

    const connection = await GitHubConnectionModel.findOne({
      user: userId,
      status: 'Connected',
    });

    if (!connection) {
      return { success: true, message: 'No active GitHub connection found.' };
    }

    const previousUsername = connection.githubUsername;

    // Securely update status and invalidate encrypted token
    connection.status = 'Disconnected';
    connection.accessTokenEncrypted = 'REVOKED';
    await connection.save();

    // Clear GitHub details from User profile
    await User.findByIdAndUpdate(userId, {
      githubUsername: '',
      githubProfileUrl: '',
    });

    // Record audit activity log & notification
    const activeMember = await OrganizationMember.findOne({ user: userId, status: 'active' });
    if (activeMember) {
      await ActivityService.recordActivity({
        organizationId: activeMember.organization.toString(),
        userId,
        action: 'github.disconnected',
        entityType: 'Integration',
        entityId: connection._id.toString(),
        metadata: {
          githubUsername: previousUsername,
          disconnectedAt: new Date().toISOString(),
        },
        ipAddress: requestMeta?.ipAddress || null,
        userAgent: requestMeta?.userAgent || null,
      });
    }

    await notificationService.createNotification({
      recipient: userId,
      type: 'System Announcement' as NotificationType,
      title: 'GitHub Integration Disconnected',
      message: `Your TaskFlow AI account has been disconnected from GitHub (@${previousUsername}).`,
      priority: 'Normal',
      data: { githubUsername: previousUsername },
    });

    return { success: true, message: 'GitHub account disconnected successfully.' };
  }
}
