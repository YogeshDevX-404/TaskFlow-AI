import { Request, Response } from 'express';
import { DatabaseService } from '../services/database.service';
import { sendSuccessResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export async function getHealthStatus(_req: Request, res: Response): Promise<Response> {
  const dbHealth = await DatabaseService.checkHealth();
  const memoryUsage = process.memoryUsage();

  const healthData = {
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbHealth,
    memory: {
      rssMb: Math.round(memoryUsage.rss / (1024 * 1024)),
      heapTotalMb: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
      heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
    },
  };

  return sendSuccessResponse(
    res,
    HTTP_STATUS.OK,
    'TaskFlow AI API Gateway & Database health check online.',
    healthData
  );
}
