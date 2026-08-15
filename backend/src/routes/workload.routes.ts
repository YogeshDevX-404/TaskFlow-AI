import { Router } from 'express';
import { WorkloadController } from '../controllers/workload.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

// Protect all workload endpoints
router.use(authenticateUser);

// Workload endpoints
router.get('/', WorkloadController.getWorkloadOverview);
router.get('/team', WorkloadController.getTeamWorkload);
router.get('/calendar', WorkloadController.getWorkloadCalendar);
router.get('/overloaded', WorkloadController.getOverloadedMembers);
router.get('/upcoming', WorkloadController.getUpcomingWork);
router.get('/overdue', WorkloadController.getOverdueWork);
router.get('/recommendations', WorkloadController.getWorkloadRecommendations);
router.post('/reassign-bulk', WorkloadController.reassignTasksBulk);

// Per-project workload
router.get('/projects/:projectId', WorkloadController.getProjectWorkload);

// Per-member workload & capacity
router.get('/members/:userId', WorkloadController.getMemberWorkload);
router.get('/members/:userId/capacity', WorkloadController.getMemberCapacity);
router.put('/members/:userId/capacity', WorkloadController.updateMemberCapacity);

export default router;
