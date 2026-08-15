import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../validators/base.validator';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';
import { authenticateUser } from '../middlewares/auth.middleware';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// --- Social OAuth Routes ---

// GitHub OAuth Login
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/api/v1/auth/social-failure' }),
  catchAsync(AuthController.socialCallback)
);

// Google OAuth Login
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/v1/auth/social-failure' }),
  catchAsync(AuthController.socialCallback)
);

// Social Auth Failure
router.get('/social-failure', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_FAILURE', message: 'Social authentication was cancelled or failed.' }, '*');
            window.close();
          } else {
            window.location.href = '/?error=auth_cancelled';
          }
        </script>
        <p>Authentication failed or was cancelled.</p>
      </body>
    </html>
  `);
});

// Direct Social Login endpoint (supporting instant popup fallback & account linking)
router.post(
  '/social-login',
  catchAsync(AuthController.socialLoginDirect)
);

// --- Local Credentials Auth Routes ---

router.post(
  '/register',
  validateRequest(registerSchema),
  catchAsync(AuthController.register)
);

router.post(
  '/login',
  validateRequest(loginSchema),
  catchAsync(AuthController.login)
);

router.post(
  '/logout',
  catchAsync(AuthController.logout)
);

router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  catchAsync(AuthController.refresh)
);

router.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  catchAsync(AuthController.forgotPassword)
);

router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  catchAsync(AuthController.resetPassword)
);

router.put(
  '/change-password',
  authenticateUser,
  validateRequest(changePasswordSchema),
  catchAsync(AuthController.changePassword)
);

router.get(
  '/me',
  authenticateUser,
  catchAsync(AuthController.getMe)
);

export default router;
