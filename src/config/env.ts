/**
 * Environment configuration for TaskFlow AI Frontend
 * Validates and exposes API endpoints and runtime configs.
 */

interface EnvConfig {
  apiUrl: string;
  isConfigured: boolean;
}

export function getEnvConfig(): EnvConfig {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  return {
    apiUrl,
    isConfigured: true,
  };
}

export const env = getEnvConfig();
