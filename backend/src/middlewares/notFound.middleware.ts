import { Request, Response } from 'express';
import { sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS, API_MESSAGES } from '../constants';

export function notFoundHandler(req: Request, res: Response): Response {
  return sendErrorResponse(
    res,
    HTTP_STATUS.NOT_FOUND,
    `Route ${req.method} ${req.originalUrl} not found.`,
    'ROUTE_NOT_FOUND',
    { method: req.method, path: req.originalUrl }
  );
}
