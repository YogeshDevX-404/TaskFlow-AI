import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// All email management endpoints require authentication
router.use(authenticateUser);

router.get('/logs', EmailController.getEmailLogs);
router.get('/logs/:id', EmailController.getEmailLogById);
router.post('/logs/:id/retry', authorizeRoles('admin'), EmailController.retryEmail);
router.post('/test', authorizeRoles('admin'), EmailController.sendTestEmail);
router.get('/preview/:template', EmailController.getTemplatePreview);

export default router;
