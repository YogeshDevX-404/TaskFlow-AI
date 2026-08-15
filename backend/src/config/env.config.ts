import dotenv from 'dotenv';
import path from 'path';
import { EnvConfig } from '../types';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export function validateEnv(): EnvConfig {
  const port = parseInt(process.env.PORT || '5000', 10);
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow-ai';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const jwtSecret = process.env.JWT_SECRET || 'development_jwt_secret_key';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'development_refresh_secret_key';
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

  const githubMockModeRaw = process.env.GITHUB_MOCK_MODE;
  // Use mock mode if GITHUB_MOCK_MODE is not explicitly 'false'
  const githubMockMode = githubMockModeRaw === 'false' ? false : true;

  const githubClientId = process.env.GITHUB_CLIENT_ID || '';
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET || '';
  const githubCallbackUrl = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/v1/integrations/github/callback';
  const githubApiUrl = process.env.GITHUB_API_URL || 'https://api.github.com';
  const githubWebhookSecret = process.env.GITHUB_WEBHOOK_SECRET || 'taskflow_github_webhook_secret_dev';
  const githubWebhookEnabled = process.env.GITHUB_WEBHOOK_ENABLED !== 'false';
  const integrationEncryptionKey = process.env.INTEGRATION_ENCRYPTION_KEY || process.env.JWT_SECRET || 'taskflow-secret-encryption-key-32';

  const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

  const emailProvider = (process.env.EMAIL_PROVIDER || 'development') as 'development' | 'smtp';
  const emailFrom = process.env.EMAIL_FROM || 'notifications@taskflow.ai';
  const emailFromName = process.env.EMAIL_FROM_NAME || 'TaskFlow AI';
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPassword = process.env.SMTP_PASSWORD || '';

  return {
    port,
    mongoUri,
    clientUrl,
    jwtSecret,
    jwtRefreshSecret,
    nodeEnv,
    githubMockMode,
    githubClientId,
    githubClientSecret,
    githubCallbackUrl,
    githubApiUrl,
    githubWebhookSecret,
    githubWebhookEnabled,
    integrationEncryptionKey,
    googleClientId,
    googleClientSecret,
    emailProvider,
    emailFrom,
    emailFromName,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPassword,
  };
}

export const config = validateEnv();
