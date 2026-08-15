import { Response } from 'express';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { PaginationMeta } from '../types';

export class ResponseService {
  public static success<T>(res: Response, message: string, data?: T, statusCode = HTTP_STATUS.OK): Response {
    return sendSuccessResponse(res, statusCode, message, data);
  }

  public static paginated<T>(
    res: Response,
    message: string,
    data: T,
    meta: PaginationMeta,
    statusCode = HTTP_STATUS.OK
  ): Response {
    return sendSuccessResponse(res, statusCode, message, data, meta);
  }

  public static error(
    res: Response,
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code = 'SERVER_ERROR',
    details?: unknown
  ): Response {
    return sendErrorResponse(res, statusCode, message, code, details);
  }
}
