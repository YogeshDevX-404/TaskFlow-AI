import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { ActivityAnalyticsController } from '../controllers/activityAnalytics.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// Protect all activity endpoints
router.use(authenticateUser);

// Core Audit Activity Logs
router.get('/', catchAsync(ActivityController.getActivities));
router.get('/export', catchAsync(ActivityController.exportActivities));

// Enterprise Developer Activity & Contribution Analytics
router.get('/analytics/overview', catchAsync(ActivityAnalyticsController.getOverview));
router.get('/analytics/developers', catchAsync(ActivityAnalyticsController.getDevelopers));
router.get('/analytics/developers/:userId', catchAsync(ActivityAnalyticsController.getDeveloperDeepDive));
router.get('/analytics/repositories', catchAsync(ActivityAnalyticsController.getRepositoryAnalytics));
router.get('/analytics/export', catchAsync(ActivityAnalyticsController.exportAnalytics));

export default router;

