import http from 'http';
import { app } from './app';
import { config } from './config/env.config';
import { connectDB, disconnectDB } from './database/connection';
import { logger } from './utils/logger';
import { initSocketServer } from './socket/socketServer';

async function bootstrap() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create HTTP Server & Attach Socket.IO Real-Time Gateway
    const httpServer = http.createServer(app);
    initSocketServer(httpServer);

    const server = httpServer.listen(config.port, () => {
      logger.info(`=======================================================`);
      logger.info(`TaskFlow AI Backend Gateway listening on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API Endpoint: http://localhost:${config.port}/api/v1`);
      logger.info(`Real-Time Socket Gateway: ws://localhost:${config.port}`);
      logger.info(`Health check: http://localhost:${config.port}/api/v1/health`);
      logger.info(`=======================================================`);
    });

    // Graceful Shutdown Handlers
    const handleGracefulShutdown = async (signal: string) => {
      logger.warn(`[Graceful Shutdown] Received ${signal} signal. Terminating server...`);

      server.close(async () => {
        logger.info('[Graceful Shutdown] Express HTTP server closed.');
        await disconnectDB();
        logger.info('[Graceful Shutdown] Process exiting cleanly.');
        process.exit(0);
      });

      // Force exit after 10s if connections fail to close
      setTimeout(() => {
        logger.error('[Graceful Shutdown] Forcefully terminating process after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('[Unhandled Rejection] Promise rejection caught:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('[Uncaught Exception] Fatal exception caught:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to launch TaskFlow AI backend server:', error);
    process.exit(1);
  }
}

bootstrap();
