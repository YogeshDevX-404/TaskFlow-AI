import { Router } from 'express';
import {
  AttachmentController,
  uploadSingleMiddleware,
} from '../controllers/attachment.controller';
import { catchAsync } from '../utils/catchAsync';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

// Protect all attachment operations with auth
router.use(authenticateUser);

router.get('/', catchAsync(AttachmentController.getTaskAttachments));
router.get('/:id', catchAsync(AttachmentController.getAttachmentById));
router.put('/:id', uploadSingleMiddleware, catchAsync(AttachmentController.updateAttachment));
router.delete('/:id', catchAsync(AttachmentController.deleteAttachment));
router.get('/:id/download', catchAsync(AttachmentController.downloadAttachment));

export default router;
