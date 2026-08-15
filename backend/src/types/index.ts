export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  error?: ApiErrorDetail;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiErrorDetail {
  code: string;
  details?: unknown;
  stack?: string;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, unknown>;
}

export interface EnvConfig {
  port: number;
  mongoUri: string;
  clientUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  nodeEnv: 'development' | 'production' | 'test';
  githubMockMode: boolean;
  githubClientId?: string;
  githubClientSecret?: string;
  githubCallbackUrl?: string;
  githubApiUrl?: string;
  githubWebhookSecret?: string;
  githubWebhookEnabled?: boolean;
  integrationEncryptionKey?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  emailProvider: 'development' | 'smtp';
  emailFrom: string;
  emailFromName: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
}

export type UserRole = 'user' | 'admin' | 'manager';

export interface IUserPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  provider?: string;
  providerId?: string;
  githubUsername?: string;
  githubProfileUrl?: string;
  googleId?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends IUserPayload {}
  }
}

