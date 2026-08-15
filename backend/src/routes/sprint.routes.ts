import { Router } from 'express';
import {
  getSprints,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
  archiveSprint,
  duplicateSprint,
  startSprint,
  completeSprint,
  cancelSprint,
  addTasksToSprint,
  removeTasksFromSprint,
  getSprintBurndown,
  getSprintBurnup,
  getSprintRetrospective,
  updateSprintRetrospective,
  getSprintActivity,
  getProjectSprintsVelocity,
} from '../controllers/sprint.controller';
import { catchAsync } from '../utils/catchAsync';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', catchAsync(getSprints));
router.post('/', catchAsync(createSprint));
router.get('/project/:projectId/velocity', catchAsync(getProjectSprintsVelocity));
router.get('/:id', catchAsync(getSprintById));
router.put('/:id', catchAsync(updateSprint));
router.delete('/:id', catchAsync(deleteSprint));
router.patch('/:id/archive', catchAsync(archiveSprint));
router.post('/:id/duplicate', catchAsync(duplicateSprint));
router.patch('/:id/start', catchAsync(startSprint));
router.patch('/:id/complete', catchAsync(completeSprint));
router.patch('/:id/cancel', catchAsync(cancelSprint));
router.post('/:id/tasks', catchAsync(addTasksToSprint));
router.delete('/:id/tasks', catchAsync(removeTasksFromSprint));

// New analytics and retro routes
router.get('/:id/burndown', catchAsync(getSprintBurndown));
router.get('/:id/burnup', catchAsync(getSprintBurnup));
router.get('/:id/retrospective', catchAsync(getSprintRetrospective));
router.post('/:id/retrospective', authenticateUser, catchAsync(updateSprintRetrospective));
router.get('/:id/activity', catchAsync(getSprintActivity));

export default router;

