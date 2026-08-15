import { Router } from 'express';
import {
  getCalendarEvents,
  getCalendarEventById,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../controllers/calendar.controller';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// /api/v1/calendar/events
router.get('/events', catchAsync(getCalendarEvents));
router.post('/events', catchAsync(createCalendarEvent));
router.get('/events/:id', catchAsync(getCalendarEventById));
router.put('/events/:id', catchAsync(updateCalendarEvent));
router.delete('/events/:id', catchAsync(deleteCalendarEvent));

export default router;
