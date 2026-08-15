import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  toggleArchive,
  togglePin,
  deleteNotification,
  getPreferences,
  updatePreferences,
} from '../controllers/notification.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

router.use(authenticateUser);

router.get('/', catchAsync(getNotifications));
router.get('/unread-count', catchAsync(getUnreadCount));
router.patch('/read-all', catchAsync(markAllAsRead));
router.get('/preferences', catchAsync(getPreferences));
router.put('/preferences', catchAsync(updatePreferences));

router.patch('/:id/read', catchAsync(markAsRead));
router.patch('/:id/archive', catchAsync(toggleArchive));
router.patch('/:id/pin', catchAsync(togglePin));
router.delete('/:id', catchAsync(deleteNotification));

export default router;
