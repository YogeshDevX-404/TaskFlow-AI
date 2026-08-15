import { Router } from 'express';
import {
  getReleases,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease,
  archiveRelease,
  duplicateRelease,
  addTasksToRelease,
  removeTasksFromRelease,
  getRoadmapData,
} from '../controllers/release.controller';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

router.get('/', catchAsync(getReleases));
router.post('/', catchAsync(createRelease));
router.get('/roadmap', catchAsync(getRoadmapData));
router.get('/:id', catchAsync(getReleaseById));
router.put('/:id', catchAsync(updateRelease));
router.delete('/:id', catchAsync(deleteRelease));
router.post('/:id/archive', catchAsync(archiveRelease));
router.post('/:id/duplicate', catchAsync(duplicateRelease));
router.post('/:id/tasks', catchAsync(addTasksToRelease));
router.delete('/:id/tasks', catchAsync(removeTasksFromRelease));

export default router;
