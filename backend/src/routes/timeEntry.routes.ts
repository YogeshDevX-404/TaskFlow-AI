import { Router } from 'express';
import { TimeEntryController } from '../controllers/timeEntry.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// All time entry routes require user authentication
router.use(authenticateUser);

router.get('/active', catchAsync(TimeEntryController.getActiveTimer));
router.get('/reports', catchAsync(TimeEntryController.getTimeReports));
router.get('/timesheet', catchAsync(TimeEntryController.getTimesheet));
router.get('/export', catchAsync(TimeEntryController.exportTimeEntries));

router.post('/start', catchAsync(TimeEntryController.startTimer));
router.post('/:id/pause', catchAsync(TimeEntryController.pauseTimer));
router.post('/:id/resume', catchAsync(TimeEntryController.resumeTimer));
router.post('/:id/stop', catchAsync(TimeEntryController.stopTimer));
router.post('/:id/cancel', catchAsync(TimeEntryController.cancelTimer));

router.get('/', catchAsync(TimeEntryController.getTimeEntries));
router.post('/', catchAsync(TimeEntryController.createWorkLog));

router.get('/:id', catchAsync(TimeEntryController.getSingleTimeEntry));
router.put('/:id', catchAsync(TimeEntryController.updateTimeEntry));
router.delete('/:id', catchAsync(TimeEntryController.deleteTimeEntry));

export default router;
