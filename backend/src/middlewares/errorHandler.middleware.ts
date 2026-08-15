import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS, API_MESSAGES } from '../constants';
import { logger } from '../utils/logger';

export interface CustomError extends Error {
  statusCode?: number;
  code?: number | string;
  errors?: Record<string, unknown>;
}

export function globalErrorHandler(
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  logger.error(`[Global Error Handler] ${err.name}: ${err.message}`, {
    stack: err.stack,
    code: err.code,
  });

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    return sendErrorResponse(
      res,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      'Validation failed for provided fields.',
      'VALIDATION_ERROR',
      err.errors,
      err.stack
    );
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    return sendErrorResponse(
      res,
      HTTP_STATUS.CONFLICT,
      'A record with this unique identifier already exists.',
      'DUPLICATE_KEY_ERROR',
      err.errors,
      err.stack
    );
  }

  // Handle Mongoose Cast Error (Invalid ObjectId)
  if (err.name === 'CastError') {
    return sendErrorResponse(
      res,
      HTTP_STATUS.BAD_REQUEST,
      'Invalid resource ID format provided.',
      'INVALID_ID_ERROR',
      undefined,
      err.stack
    );
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendErrorResponse(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      API_MESSAGES.UNAUTHORIZED,
      'INVALID_TOKEN',
      undefined,
      err.stack
    );
  }

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || API_MESSAGES.INTERNAL_ERROR;
  const errorCode = typeof err.code === 'string' ? err.code : 'SERVER_ERROR';

  return sendErrorResponse(res, statusCode, message, errorCode, undefined, err.stack);
}
