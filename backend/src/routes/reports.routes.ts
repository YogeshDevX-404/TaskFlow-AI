import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { catchAsync } from '../utils/catchAsync';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

// Protect all report endpoints with JWT auth
router.use(authenticateUser);

router.get('/overview', catchAsync(ReportsController.getOverview));
router.get('/projects', catchAsync(ReportsController.getProjectHealth));
router.get('/tasks', catchAsync(ReportsController.getTaskAnalytics));
router.get('/team', catchAsync(ReportsController.getTeamPerformance));
router.get('/users/:userId?', catchAsync(ReportsController.getUserReport));
router.get('/sprints/:sprintId?', catchAsync(ReportsController.getSprintReport));
router.get('/velocity', catchAsync(ReportsController.getSprintVelocity));
router.get('/activity', catchAsync(ReportsController.getActivityAnalytics));
router.get('/export', catchAsync(ReportsController.exportReport));

export default router;
