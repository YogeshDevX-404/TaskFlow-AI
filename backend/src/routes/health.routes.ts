import { Router } from 'express';
import { getHealthStatus } from '../controllers/health.controller';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

router.get('/', catchAsync(getHealthStatus));

export default router;
