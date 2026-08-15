import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issueMap = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        return sendErrorResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          'Validation error in request parameters.',
          'VALIDATION_ERROR',
          issueMap
        );
      }
      next(error);
    }
  };
}
