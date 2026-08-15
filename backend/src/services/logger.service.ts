import { logger } from '../utils/logger';

export class LoggerService {
  public static logInfo(message: string, context?: Record<string, unknown>): void {
    logger.info(message, context || '');
  }

  public static logError(message: string, error?: unknown): void {
    logger.error(message, error || '');
  }

  public static logWarn(message: string, context?: Record<string, unknown>): void {
    logger.warn(message, context || '');
  }
}
