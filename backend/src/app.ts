import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import 'express-async-errors';

import apiV1Router from './routes';
import { notFoundHandler } from './middlewares/notFound.middleware';
import { globalErrorHandler } from './middlewares/errorHandler.middleware';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { config } from './config/env.config';
import { configurePassport } from './config/passport.config';

export function createApp(): Express {
  const app = express();

  // Configure Passport strategies
  configurePassport();

  // Security headers
  app.use(helmet({ contentSecurityPolicy: false }));

  // CORS configuration
  app.use(
    cors({
      origin: [config.clientUrl, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Organization-Id',
        'x-organization-id',
        'X-Hub-Signature-256',
        'X-GitHub-Event',
        'X-GitHub-Delivery',
        'x-hub-signature-256',
        'x-github-event',
        'x-github-delivery',
      ],
    })
  );

  // Compression & parsers
  app.use(compression());
  app.use(cookieParser());
  app.use(
    express.json({
      limit: '10mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize Passport middleware
  app.use(passport.initialize());

  // Logging
  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
    app.use(requestLogger);
  }

  // Base API v1 Routes
  app.use('/api/v1', apiV1Router);

  // Root endpoint info
  app.get('/', (_req, res) => {
    res.json({
      name: 'TaskFlow AI Enterprise Gateway',
      status: 'operational',
      version: 'v1.0.0',
      apiVersion: '/api/v1',
      documentation: '/api/v1/health',
    });
  });

  // 404 & Global Error Handling
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

export const app = createApp();
