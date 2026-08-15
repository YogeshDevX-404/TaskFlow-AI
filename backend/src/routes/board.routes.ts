import { Router } from 'express';
import { BoardController } from '../controllers/board.controller';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

router.get('/:projectId', catchAsync(BoardController.getBoardByProjectId));
router.put('/:projectId/columns', catchAsync(BoardController.updateColumns));
router.post('/:projectId/columns', catchAsync(BoardController.addColumn));
router.put('/:projectId/columns/:columnId', catchAsync(BoardController.renameColumn));
router.delete('/:projectId/columns/:columnId', catchAsync(BoardController.deleteColumn));
router.put('/:projectId/settings', catchAsync(BoardController.updateSettings));
router.post('/:projectId/bulk-tasks', catchAsync(BoardController.bulkUpdateTasks));

export default router;
