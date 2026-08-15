import { Router } from 'express';
import { InviteController } from '../controllers/invite.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { validateRequest } from '../validators/base.validator';
import { acceptInviteSchema, rejectInviteSchema } from '../validators/member.validator';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// Public token verification
router.get('/verify/:token', catchAsync(InviteController.verifyToken));

// Protected accept & reject endpoints
router.post(
  '/accept',
  authenticateUser,
  validateRequest(acceptInviteSchema),
  catchAsync(InviteController.accept)
);

router.post(
  '/reject',
  authenticateUser,
  validateRequest(rejectInviteSchema),
  catchAsync(InviteController.reject)
);

export default router;
