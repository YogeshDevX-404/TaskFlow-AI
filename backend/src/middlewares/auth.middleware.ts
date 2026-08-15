import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import { TokenPayload, UserRole } from '../types';
import { sendErrorResponse } from '../utils/apiResponse';
import { HTTP_STATUS, API_MESSAGES } from '../constants';
import { User } from '../models/user.model';

export async function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return sendErrorResponse(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      API_MESSAGES.UNAUTHORIZED,
      'NO_TOKEN_PROVIDED'
    );
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        'User account associated with token is no longer active.',
        'INACTIVE_USER'
      );
    }

    req.user = user.toUserPayload();
    next();
  } catch {
    return sendErrorResponse(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      'Session expired or invalid authentication token.',
      'EXPIRED_OR_INVALID_TOKEN'
    );
  }
}

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        API_MESSAGES.UNAUTHORIZED,
        'UNAUTHENTICATED'
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendErrorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        API_MESSAGES.FORBIDDEN,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  };
}
