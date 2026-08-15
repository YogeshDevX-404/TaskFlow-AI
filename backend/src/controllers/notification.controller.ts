import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { notificationPreferenceService } from '../services/notification-preference.service';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const {
      search,
      unread,
      priority,
      type,
      projectId,
      workspaceId,
      isArchived,
      isPinned,
      sort,
      page,
      limit,
    } = req.query;

    const filters = {
      recipientId: userId.toString(),
      search: search ? String(search) : undefined,
      unreadOnly: unread === 'true',
      priority: priority ? (String(priority) as any) : undefined,
      type: type ? (String(type) as any) : undefined,
      projectId: projectId ? String(projectId) : undefined,
      workspaceId: workspaceId ? String(workspaceId) : undefined,
      isArchived: isArchived === 'true' ? true : isArchived === 'false' ? false : undefined,
      isPinned: isPinned === 'true' ? true : isPinned === 'false' ? false : undefined,
      sort: sort ? (String(sort) as any) : 'newest',
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 20,
    };

    const result = await notificationService.getNotifications(filters);

    res.status(200).json({
      success: true,
      data: result.notifications,
      total: result.total,
      unreadCount: result.unreadCount,
      page: result.page,
      pages: result.pages,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch notifications' });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const count = await notificationService.getUnreadCount(userId.toString());
    res.status(200).json({ success: true, count });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get unread count' });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { read = true } = req.body;

    const notification = await notificationService.markAsRead(id, userId.toString(), read);
    res.status(200).json({ success: true, data: notification });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update notification status' });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const result = await notificationService.markAllAsRead(userId.toString());
    res.status(200).json({ success: true, message: 'All notifications marked as read', count: result.count });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to mark all as read' });
  }
};

export const toggleArchive = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { isArchived } = req.body;

    const updated = await notificationService.toggleArchive(id, userId.toString(), isArchived);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to archive notification' });
  }
};

export const togglePin = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { isPinned } = req.body;

    const updated = await notificationService.togglePin(id, userId.toString(), isPinned);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to pin notification' });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    await notificationService.deleteNotification(id, userId.toString());
    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to delete notification' });
  }
};

export const getPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const preferences = await notificationPreferenceService.getPreferences(userId.toString());
    res.status(200).json({ success: true, data: preferences });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get notification preferences' });
  }
};

export const updatePreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const updated = await notificationPreferenceService.updatePreferences(userId.toString(), req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update preferences' });
  }
};
