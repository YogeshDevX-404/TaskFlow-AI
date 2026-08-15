import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { catchAsync } from '../utils/catchAsync';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

// Require auth for all comment actions
router.use(authenticateUser);

router.put('/:id', catchAsync(CommentController.updateComment));
router.delete('/:id', catchAsync(CommentController.deleteComment));
router.post('/:id/restore', catchAsync(CommentController.restoreComment));
router.post('/:id/reply', catchAsync(CommentController.replyComment));
router.post('/:id/reactions', catchAsync(CommentController.toggleReaction));

export default router;
