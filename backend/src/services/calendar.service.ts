import { Types } from 'mongoose';
import {
  CalendarEvent,
  ICalendarEventDocument,
  ICalendarEventPayload,
  CalendarEventType,
  CalendarEventStatus,
  CalendarEventPriority,
} from '../models/calendarEvent.model';
import { TaskModel } from '../models/task.model';
import { Sprint } from '../models/sprint.model';

export interface GetCalendarEventsFilter {
  organizationId?: string;
  workspaceId?: string;
  projectId?: string;
  sprintId?: string;
  startDate?: string;
  endDate?: string;
  eventType?: CalendarEventType | 'all';
  status?: CalendarEventStatus | 'all';
  priority?: CalendarEventPriority | 'all';
  assigneeId?: string;
  isMilestone?: boolean;
  searchQuery?: string;
  includeTasks?: boolean;
  includeSprints?: boolean;
}

export interface CreateCalendarEventDto {
  title: string;
  description?: string;
  eventType?: CalendarEventType;
  startDate: string | Date;
  endDate: string | Date;
  allDay?: boolean;
  color?: string;
  status?: CalendarEventStatus;
  priority?: CalendarEventPriority;
  organizationId?: string;
  workspaceId?: string;
  projectId?: string;
  sprintId?: string;
  taskId?: string;
  assignees?: string[];
  dependencies?: string[];
  progress?: number;
  isMilestone?: boolean;
  tags?: string[];
}

export interface UpdateCalendarEventDto extends Partial<CreateCalendarEventDto> {}

class CalendarService {
  /**
   * Get calendar events with filters, plus aggregated tasks & sprints if requested
   */
  async getEvents(filter: GetCalendarEventsFilter): Promise<ICalendarEventPayload[]> {
    const query: any = {};

    if (filter.organizationId && Types.ObjectId.isValid(filter.organizationId)) {
      query.organization = new Types.ObjectId(filter.organizationId);
    }
    if (filter.workspaceId && Types.ObjectId.isValid(filter.workspaceId)) {
      query.workspace = new Types.ObjectId(filter.workspaceId);
    }
    if (filter.projectId && Types.ObjectId.isValid(filter.projectId)) {
      query.project = new Types.ObjectId(filter.projectId);
    }
    if (filter.sprintId && Types.ObjectId.isValid(filter.sprintId)) {
      query.sprint = new Types.ObjectId(filter.sprintId);
    }
    if (filter.eventType && filter.eventType !== 'all') {
      query.eventType = filter.eventType;
    }
    if (filter.status && filter.status !== 'all') {
      query.status = filter.status;
    }
    if (filter.priority && filter.priority !== 'all') {
      query.priority = filter.priority;
    }
    if (filter.assigneeId && Types.ObjectId.isValid(filter.assigneeId)) {
      query.assignees = new Types.ObjectId(filter.assigneeId);
    }
    if (filter.isMilestone !== undefined) {
      query.isMilestone = filter.isMilestone;
    }

    if (filter.startDate || filter.endDate) {
      query.$and = query.$and || [];
      if (filter.startDate) {
        query.$and.push({ endDate: { $gte: new Date(filter.startDate) } });
      }
      if (filter.endDate) {
        query.$and.push({ startDate: { $lte: new Date(filter.endDate) } });
      }
    }

    if (filter.searchQuery) {
      const searchRegex = new RegExp(filter.searchQuery, 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { tags: searchRegex }];
    }

    const customEvents = await CalendarEvent.find(query)
      .populate('organization', 'name')
      .populate('workspace', 'name')
      .populate('project', 'name projectKey')
      .populate('sprint', 'name')
      .populate('taskId', 'title taskKey status')
      .populate('assignees', 'firstName lastName email avatarUrl')
      .populate('createdBy', 'firstName lastName email')
      .sort({ startDate: 1 });

    const results: ICalendarEventPayload[] = customEvents.map((evt) => evt.toCalendarEventPayload());

    // Aggregate Tasks into events if requested or default true
    if (filter.includeTasks !== false) {
      const taskQuery: any = { isArchived: { $ne: true } };
      if (filter.projectId && Types.ObjectId.isValid(filter.projectId)) {
        taskQuery.project = new Types.ObjectId(filter.projectId);
      }
      if (filter.sprintId && Types.ObjectId.isValid(filter.sprintId)) {
        taskQuery.sprint = new Types.ObjectId(filter.sprintId);
      }
      if (filter.assigneeId && Types.ObjectId.isValid(filter.assigneeId)) {
        taskQuery.assignee = new Types.ObjectId(filter.assigneeId);
      }

      const tasks = await TaskModel.find(taskQuery)
        .populate('project', 'name projectKey')
        .populate('sprint', 'name')
        .populate('assignee', 'firstName lastName email avatarUrl')
        .limit(200);

      tasks.forEach((t) => {
        const start = t.startDate ? new Date(t.startDate) : t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt);
        const end = t.dueDate ? new Date(t.dueDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);

        results.push({
          id: `task-${t._id.toString()}`,
          title: `[${t.taskKey}] ${t.title}`,
          description: t.description || '',
          eventType: 'Task',
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          allDay: true,
          color: t.status === 'Done' ? '#10b981' : t.status === 'In Progress' ? '#3b82f6' : '#8b5cf6',
          status: t.status === 'Done' ? 'Completed' : t.status === 'In Progress' ? 'In Progress' : 'Planned',
          priority: (t.priority as CalendarEventPriority) || 'Medium',
          project: typeof t.project === 'object' && t.project ? { id: (t.project as any)._id, name: (t.project as any).name } : t.project,
          sprint: typeof t.sprint === 'object' && t.sprint ? { id: (t.sprint as any)._id, name: (t.sprint as any).name } : t.sprint,
          taskId: t._id.toString(),
          assignees: t.assignee ? [{ id: (t.assignee as any)._id, name: `${(t.assignee as any).firstName || ''} ${(t.assignee as any).lastName || ''}`.trim() }] : [],
          progress: t.status === 'Done' ? 100 : t.status === 'In Progress' ? 50 : 0,
          isMilestone: false,
          tags: (t as any).tags || [],
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        });
      });
    }

    // Aggregate Sprints into events if requested or default true
    if (filter.includeSprints !== false) {
      const sprintQuery: any = { isArchived: { $ne: true } };
      if (filter.projectId && Types.ObjectId.isValid(filter.projectId)) {
        sprintQuery.project = new Types.ObjectId(filter.projectId);
      }

      const sprints = await Sprint.find(sprintQuery).populate('project', 'name projectKey').limit(100);

      sprints.forEach((s) => {
        if (s.startDate && s.endDate) {
          results.push({
            id: `sprint-${s._id.toString()}`,
            title: `Sprint: ${s.name}`,
            description: s.goal || s.description || '',
            eventType: 'Sprint',
            startDate: new Date(s.startDate).toISOString(),
            endDate: new Date(s.endDate).toISOString(),
            allDay: true,
            color: s.status === 'Active' ? '#10b981' : s.status === 'Completed' ? '#6366f1' : '#f59e0b',
            status: s.status === 'Completed' ? 'Completed' : s.status === 'Active' ? 'In Progress' : 'Planned',
            priority: 'High',
            project: typeof s.project === 'object' && s.project ? { id: (s.project as any)._id, name: (s.project as any).name } : s.project,
            progress: s.status === 'Completed' ? 100 : s.status === 'Active' ? 50 : 0,
            isMilestone: false,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
          });
        }
      });
    }

    return results;
  }

  async getEventById(id: string): Promise<ICalendarEventPayload> {
    const event = await CalendarEvent.findById(id)
      .populate('organization', 'name')
      .populate('workspace', 'name')
      .populate('project', 'name projectKey')
      .populate('sprint', 'name')
      .populate('taskId', 'title taskKey status')
      .populate('assignees', 'firstName lastName email avatarUrl')
      .populate('createdBy', 'firstName lastName email');

    if (!event) {
      throw new Error('Calendar event not found');
    }

    return event.toCalendarEventPayload();
  }

  async createEvent(data: CreateCalendarEventDto, userId: string): Promise<ICalendarEventPayload> {
    const eventData: any = {
      title: data.title,
      description: data.description || '',
      eventType: data.eventType || 'Milestone',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      allDay: Boolean(data.allDay),
      color: data.color || '#6366f1',
      status: data.status || 'Planned',
      priority: data.priority || 'Medium',
      progress: data.progress ?? (data.isMilestone ? 100 : 0),
      isMilestone: data.eventType === 'Milestone' || Boolean(data.isMilestone),
      tags: data.tags || [],
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    };

    if (data.organizationId && Types.ObjectId.isValid(data.organizationId)) {
      eventData.organization = new Types.ObjectId(data.organizationId);
    }
    if (data.workspaceId && Types.ObjectId.isValid(data.workspaceId)) {
      eventData.workspace = new Types.ObjectId(data.workspaceId);
    }
    if (data.projectId && Types.ObjectId.isValid(data.projectId)) {
      eventData.project = new Types.ObjectId(data.projectId);
    }
    if (data.sprintId && Types.ObjectId.isValid(data.sprintId)) {
      eventData.sprint = new Types.ObjectId(data.sprintId);
    }
    if (data.taskId && Types.ObjectId.isValid(data.taskId)) {
      eventData.taskId = new Types.ObjectId(data.taskId);
    }
    if (Array.isArray(data.assignees)) {
      eventData.assignees = data.assignees
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));
    }
    if (Array.isArray(data.dependencies)) {
      eventData.dependencies = data.dependencies
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));
    }

    const event = new CalendarEvent(eventData);
    await event.save();

    return this.getEventById(event._id.toString());
  }

  async updateEvent(id: string, data: UpdateCalendarEventDto, userId: string): Promise<ICalendarEventPayload> {
    const event = await CalendarEvent.findById(id);
    if (!event) {
      throw new Error('Calendar event not found');
    }

    if (data.title !== undefined) event.title = data.title;
    if (data.description !== undefined) event.description = data.description;
    if (data.eventType !== undefined) {
      event.eventType = data.eventType;
      if (data.eventType === 'Milestone') event.isMilestone = true;
    }
    if (data.startDate !== undefined) event.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) event.endDate = new Date(data.endDate);
    if (data.allDay !== undefined) event.allDay = Boolean(data.allDay);
    if (data.color !== undefined) event.color = data.color;
    if (data.status !== undefined) event.status = data.status;
    if (data.priority !== undefined) event.priority = data.priority;
    if (data.progress !== undefined) event.progress = data.progress;
    if (data.isMilestone !== undefined) event.isMilestone = Boolean(data.isMilestone);
    if (data.tags !== undefined) event.tags = data.tags;

    if (data.projectId !== undefined) {
      event.project = Types.ObjectId.isValid(data.projectId) ? new Types.ObjectId(data.projectId) : undefined;
    }
    if (data.sprintId !== undefined) {
      event.sprint = Types.ObjectId.isValid(data.sprintId) ? new Types.ObjectId(data.sprintId) : undefined;
    }
    if (data.taskId !== undefined) {
      event.taskId = Types.ObjectId.isValid(data.taskId) ? new Types.ObjectId(data.taskId) : undefined;
    }
    if (Array.isArray(data.assignees)) {
      event.assignees = data.assignees
        .filter((aId) => Types.ObjectId.isValid(aId))
        .map((aId) => new Types.ObjectId(aId));
    }
    if (Array.isArray(data.dependencies)) {
      event.dependencies = data.dependencies
        .filter((dId) => Types.ObjectId.isValid(dId))
        .map((dId) => new Types.ObjectId(dId));
    }

    event.updatedBy = new Types.ObjectId(userId);
    await event.save();

    return this.getEventById(event._id.toString());
  }

  async deleteEvent(id: string): Promise<{ message: string }> {
    const event = await CalendarEvent.findByIdAndDelete(id);
    if (!event) {
      throw new Error('Calendar event not found');
    }
    return { message: 'Calendar event deleted successfully' };
  }
}

export const calendarService = new CalendarService();
