import { Request, Response } from 'express';
import { calendarService } from '../services/calendar.service';

export const getCalendarEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      organizationId,
      workspaceId,
      projectId,
      sprintId,
      startDate,
      endDate,
      eventType,
      status,
      priority,
      assigneeId,
      isMilestone,
      searchQuery,
      includeTasks,
      includeSprints,
    } = req.query;

    const events = await calendarService.getEvents({
      organizationId: organizationId as string,
      workspaceId: workspaceId as string,
      projectId: projectId as string,
      sprintId: sprintId as string,
      startDate: startDate as string,
      endDate: endDate as string,
      eventType: eventType as any,
      status: status as any,
      priority: priority as any,
      assigneeId: assigneeId as string,
      isMilestone: isMilestone === 'true' ? true : isMilestone === 'false' ? false : undefined,
      searchQuery: searchQuery as string,
      includeTasks: includeTasks === 'false' ? false : true,
      includeSprints: includeSprints === 'false' ? false : true,
    });

    res.json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch calendar events',
    });
  }
};

export const getCalendarEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await calendarService.getEventById(id);

    res.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Calendar event not found',
    });
  }
};

export const createCalendarEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const event = await calendarService.createEvent(req.body, userId);

    res.status(201).json({
      success: true,
      data: event,
      message: 'Calendar event created successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create calendar event',
    });
  }
};

export const updateCalendarEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;
    const event = await calendarService.updateEvent(id, req.body, userId);

    res.json({
      success: true,
      data: event,
      message: 'Calendar event updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update calendar event',
    });
  }
};

export const deleteCalendarEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await calendarService.deleteEvent(id);

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete calendar event',
    });
  }
};
