import passport from 'passport';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { User, IUserDocument } from '../models/user.model';
import { config } from './env.config';

export interface SocialProfileData {
  provider: 'github' | 'google';
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  githubUsername?: string;
  githubProfileUrl?: string;
  googleId?: string;
}

/**
 * Common account linking & account creation handler for Passport strategy callbacks
 */
export async function findOrCreateSocialUser(profileData: SocialProfileData): Promise<IUserDocument> {
  const normalizedEmail = profileData.email.toLowerCase();

  // 1. Search for existing user by email
  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    // ACCOUNT LINKING: Email exists -> Link provider details automatically
    if (profileData.provider === 'github') {
      user.githubUsername = profileData.githubUsername || user.githubUsername || '';
      user.githubProfileUrl = profileData.githubProfileUrl || user.githubProfileUrl || '';
      user.providerId = profileData.providerId || user.providerId || '';
      if (!user.provider || user.provider === 'local') {
        user.provider = 'github';
      }
    } else if (profileData.provider === 'google') {
      user.googleId = profileData.googleId || profileData.providerId || user.googleId || '';
      user.providerId = profileData.providerId || user.providerId || '';
      if (!user.provider || user.provider === 'local') {
        user.provider = 'google';
      }
    }

    if (!user.avatar && profileData.avatar) {
      user.avatar = profileData.avatar;
    }

    user.isVerified = true;
    user.lastLogin = new Date();
    await user.save();
    return user;
  }

  // 2. FIRST LOGIN: User does not exist -> Automatically create account
  user = new User({
    firstName: profileData.firstName || 'User',
    lastName: profileData.lastName || '',
    email: normalizedEmail,
    avatar: profileData.avatar || '',
    provider: profileData.provider,
    providerId: profileData.providerId,
    githubUsername: profileData.githubUsername || '',
    githubProfileUrl: profileData.githubProfileUrl || '',
    googleId: profileData.googleId || '',
    isVerified: true,
    isActive: true,
    lastLogin: new Date(),
  });

  await user.save();
  return user;
}

export function configurePassport(): void {
  // 1. GitHub Strategy
  const githubClientId = config.githubClientId || process.env.GITHUB_CLIENT_ID || 'dummy-github-id';
  const githubClientSecret = config.githubClientSecret || process.env.GITHUB_CLIENT_SECRET || 'dummy-github-secret';

  passport.use(
    new GitHubStrategy(
      {
        clientID: githubClientId,
        clientSecret: githubClientSecret,
        callbackURL: '/api/v1/auth/github/callback',
        scope: ['user:email'],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: GitHubProfile,
        done: (err: unknown, user?: IUserDocument | false) => void
      ) => {
        try {
          const email =
            profile.emails?.[0]?.value ||
            `${profile.username || profile.id}@users.noreply.github.com`;

          const displayNameParts = (profile.displayName || profile.username || 'GitHub User').trim().split(' ');
          const firstName = displayNameParts[0] || 'GitHub';
          const lastName = displayNameParts.slice(1).join(' ') || '';
          const rawJson = (profile as unknown as { _json?: { avatar_url?: string; html_url?: string } })._json || {};
          const avatar = profile.photos?.[0]?.value || rawJson.avatar_url || '';

          const user = await findOrCreateSocialUser({
            provider: 'github',
            providerId: profile.id,
            email,
            firstName,
            lastName,
            avatar,
            githubUsername: profile.username || profile.displayName || '',
            githubProfileUrl: profile.profileUrl || rawJson.html_url || '',
          });

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // 2. Google Strategy
  const googleClientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID || 'dummy-google-id';
  const googleClientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-secret';

  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: '/api/v1/auth/google/callback',
        scope: ['profile', 'email'],
      } as any,
      (
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: any
      ) => {
        (async () => {
          try {
            const email = profile.emails?.[0]?.value || `${profile.id}@google.user`;
            const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'Google';
            const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || 'User';
            const avatar = profile.photos?.[0]?.value || '';

            const user = await findOrCreateSocialUser({
              provider: 'google',
              providerId: profile.id,
              googleId: profile.id,
              email,
              firstName,
              lastName,
              avatar,
            });

            return done(null, user);
          } catch (error) {
            return done(error, false);
          }
        })();
      }
    )
  );
}
