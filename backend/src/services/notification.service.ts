import {
  NotificationModel,
  INotificationPayload,
  NotificationType,
  NotificationPriority,
} from '../models/notification.model';
import { Types } from 'mongoose';
import { broadcastNotificationToUser } from '../socket/socketServer';

export interface GetNotificationsFilter {
  recipientId: string;
  search?: string;
  unreadOnly?: boolean;
  priority?: NotificationPriority | 'all';
  type?: NotificationType | 'all';
  projectId?: string;
  workspaceId?: string;
  isArchived?: boolean;
  isPinned?: boolean;
  sort?: 'newest' | 'oldest' | 'priority';
  page?: number;
  limit?: number;
}

export class NotificationService {
  async getNotifications(filters: GetNotificationsFilter): Promise<{
    notifications: INotificationPayload[];
    total: number;
    unreadCount: number;
    page: number;
    pages: number;
  }> {
    const {
      recipientId,
      search,
      unreadOnly,
      priority,
      type,
      projectId,
      workspaceId,
      isArchived,
      isPinned,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = filters;

    if (!Types.ObjectId.isValid(recipientId)) {
      throw new Error('Invalid recipient ID');
    }

    const query: any = {
      recipient: new Types.ObjectId(recipientId),
    };

    if (isArchived !== undefined) {
      query.isArchived = isArchived;
    } else {
      query.isArchived = false; // By default show non-archived
    }

    if (unreadOnly) {
      query.read = false;
    }

    if (isPinned !== undefined) {
      query.isPinned = isPinned;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (projectId && Types.ObjectId.isValid(projectId)) {
      query.project = new Types.ObjectId(projectId);
    }

    if (workspaceId && Types.ObjectId.isValid(workspaceId)) {
      query.workspace = new Types.ObjectId(workspaceId);
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { message: searchRegex }];
    }

    let sortOptions: any = { isPinned: -1, createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { isPinned: -1, createdAt: 1 };
    } else if (sort === 'priority') {
      sortOptions = { isPinned: -1, priority: -1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    // Query database directly without seed placeholders

    const [docs, total, unreadCount] = await Promise.all([
      NotificationModel.find(query)
        .populate('sender', 'firstName lastName email avatar name')
        .populate('project', 'name key projectKey color')
        .populate('task', 'title taskKey status priority')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      NotificationModel.countDocuments(query),
      NotificationModel.countDocuments({
        recipient: new Types.ObjectId(recipientId),
        read: false,
        isArchived: false,
      }),
    ]);

    const pages = Math.ceil(total / limit) || 1;

    return {
      notifications: docs.map((doc) => doc.toPayload()),
      total,
      unreadCount,
      page,
      pages,
    };
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    if (!Types.ObjectId.isValid(recipientId)) return 0;
    return await NotificationModel.countDocuments({
      recipient: new Types.ObjectId(recipientId),
      read: false,
      isArchived: false,
    });
  }

  async markAsRead(id: string, recipientId: string, read: boolean = true): Promise<INotificationPayload> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid notification ID');
    }

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: id, recipient: recipientId },
      {
        read,
        readAt: read ? new Date() : null,
      },
      { new: true }
    )
      .populate('sender', 'firstName lastName email avatar name')
      .populate('project', 'name key projectKey color')
      .populate('task', 'title taskKey status priority');

    if (!notification) {
      throw new Error('Notification not found or unauthorized');
    }

    return notification.toPayload();
  }

  async markAllAsRead(recipientId: string): Promise<{ count: number }> {
    if (!Types.ObjectId.isValid(recipientId)) {
      throw new Error('Invalid recipient ID');
    }

    const result = await NotificationModel.updateMany(
      { recipient: recipientId, read: false },
      { read: true, readAt: new Date() }
    );

    return { count: result.modifiedCount || 0 };
  }

  async toggleArchive(id: string, recipientId: string, isArchived?: boolean): Promise<INotificationPayload> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid notification ID');
    }

    const existing = await NotificationModel.findOne({ _id: id, recipient: recipientId });
    if (!existing) {
      throw new Error('Notification not found or unauthorized');
    }

    const targetArchived = isArchived !== undefined ? isArchived : !existing.isArchived;

    existing.isArchived = targetArchived;
    await existing.save();

    return existing.toPayload();
  }

  async togglePin(id: string, recipientId: string, isPinned?: boolean): Promise<INotificationPayload> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid notification ID');
    }

    const existing = await NotificationModel.findOne({ _id: id, recipient: recipientId });
    if (!existing) {
      throw new Error('Notification not found or unauthorized');
    }

    const targetPinned = isPinned !== undefined ? isPinned : !existing.isPinned;

    existing.isPinned = targetPinned;
    await existing.save();

    return existing.toPayload();
  }

  async deleteNotification(id: string, recipientId: string): Promise<{ success: boolean }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid notification ID');
    }

    const deleted = await NotificationModel.findOneAndDelete({ _id: id, recipient: recipientId });
    if (!deleted) {
      throw new Error('Notification not found or unauthorized');
    }

    return { success: true };
  }

  async createNotification(payload: {
    recipient: string;
    sender?: string;
    actor?: string;
    organization?: string;
    workspace?: string;
    project?: string;
    task?: string;
    type: NotificationType;
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
    actionUrl?: string;
    data?: Record<string, any>;
    priority?: NotificationPriority;
  }): Promise<INotificationPayload> {
    return NotificationService.createNotification(payload);
  }

  public static async createNotification(payload: {
    recipient: string;
    sender?: string;
    actor?: string;
    organization?: string;
    workspace?: string;
    project?: string;
    task?: string;
    type: NotificationType;
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
    actionUrl?: string;
    data?: Record<string, any>;
    priority?: NotificationPriority;
  }): Promise<INotificationPayload> {
    const senderId = payload.sender || payload.actor;
    const notification = new NotificationModel({
      recipient: new Types.ObjectId(payload.recipient),
      sender: senderId && Types.ObjectId.isValid(senderId) ? new Types.ObjectId(senderId) : null,
      organization: payload.organization && Types.ObjectId.isValid(payload.organization) ? new Types.ObjectId(payload.organization) : null,
      workspace: payload.workspace && Types.ObjectId.isValid(payload.workspace) ? new Types.ObjectId(payload.workspace) : null,
      project: payload.project && Types.ObjectId.isValid(payload.project) ? new Types.ObjectId(payload.project) : null,
      task: payload.task && Types.ObjectId.isValid(payload.task) ? new Types.ObjectId(payload.task) : null,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: {
        ...(payload.data || {}),
        ...(payload.entityType ? { entityType: payload.entityType } : {}),
        ...(payload.entityId ? { entityId: payload.entityId } : {}),
        ...(payload.actionUrl ? { actionUrl: payload.actionUrl } : {}),
      },
      priority: payload.priority || 'Normal',
      deliveryStatus: 'Delivered',
    });

    await notification.save();
    const result = notification.toPayload();

    try {
      broadcastNotificationToUser(payload.recipient, {
        notificationId: result.id,
        recipientId: payload.recipient,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        priority: payload.priority,
        data: payload.data,
        createdAt: result.createdAt,
      });
    } catch (e) {
      // Ignore socket emit errors if server not yet booted
    }

    return result;
  }

  private async seedSampleNotifications(recipientId: string): Promise<void> {
    const samples = [
      {
        recipient: new Types.ObjectId(recipientId),
        type: 'Task Assigned' as NotificationType,
        title: 'Assigned to TFA-104: High Availability Cluster Setup',
        message: 'Alex Rivera assigned you to a critical architecture task for TaskFlow AI Core.',
        priority: 'High' as NotificationPriority,
        read: false,
        isPinned: true,
        data: { taskKey: 'TFA-104', link: '/tasks/TFA-104' },
      },
      {
        recipient: new Types.ObjectId(recipientId),
        type: 'Mention' as NotificationType,
        title: 'Mentioned in comment on Sprint 12 Backlog',
        message: 'Sarah Chen: "@you Could you review the release candidates for v2.0 before end of day?"',
        priority: 'Critical' as NotificationPriority,
        read: false,
        isPinned: false,
        data: { taskKey: 'TFA-88', link: '/sprints/12' },
      },
      {
        recipient: new Types.ObjectId(recipientId),
        type: 'Sprint Started' as NotificationType,
        title: 'Sprint 14: Q3 Roadmap Engine has officially started',
        message: 'The team has committed 42 story points across 18 work items.',
        priority: 'Normal' as NotificationPriority,
        read: false,
        isPinned: false,
        data: { sprintName: 'Sprint 14' },
      },
      {
        recipient: new Types.ObjectId(recipientId),
        type: 'Release Published' as NotificationType,
        title: 'v2.0.0-rc1 Enterprise Release is now live',
        message: 'Enterprise Roadmap, Version Management & Milestone Tracker deployed successfully.',
        priority: 'Normal' as NotificationPriority,
        read: true,
        readAt: new Date(Date.now() - 3600000 * 24),
        isPinned: false,
        data: { version: '2.0.0-rc1' },
      },
      {
        recipient: new Types.ObjectId(recipientId),
        type: 'Comment Added' as NotificationType,
        title: 'New comment on TFA-92: RBAC Policy Engine',
        message: 'Michael Vance added 3 security policy assertions.',
        priority: 'Low' as NotificationPriority,
        read: true,
        readAt: new Date(Date.now() - 3600000 * 48),
        isPinned: false,
        data: { taskKey: 'TFA-92' },
      },
    ];

    await NotificationModel.insertMany(samples);
  }
}

export const notificationService = new NotificationService();
