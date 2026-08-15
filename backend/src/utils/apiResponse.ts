import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types';
import { HTTP_STATUS } from '../constants';

export function sendSuccessResponse<T>(
  res: Response,
  statusCode: number = HTTP_STATUS.OK,
  message: string,
  data?: T,
  meta?: PaginationMeta
): Response {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(responseBody);
}

export function sendErrorResponse(
  res: Response,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  message: string,
  code: string = 'INTERNAL_SERVER_ERROR',
  details?: unknown,
  stack?: string
): Response {
  const responseBody: ApiResponse = {
    success: false,
    message,
    error: {
      code,
      details,
      stack: process.env.NODE_ENV === 'development' ? stack : undefined,
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(responseBody);
}
