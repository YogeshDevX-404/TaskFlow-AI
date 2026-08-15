import { Router } from 'express';
import { getRoadmapData } from '../controllers/release.controller';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

router.get('/', catchAsync(getRoadmapData));

export default router;
