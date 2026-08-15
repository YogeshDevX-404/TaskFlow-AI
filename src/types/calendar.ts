export type CalendarEventType = 'Task' | 'Sprint' | 'Milestone' | 'Release' | 'Meeting' | 'Deadline';
export type CalendarEventStatus = 'Planned' | 'In Progress' | 'Completed' | 'Delayed' | 'Cancelled';
export type CalendarEventPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';
export type TimelineZoomLevel = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  color?: string;
  status: CalendarEventStatus;
  priority: CalendarEventPriority;
  organization?: any;
  workspace?: any;
  project?: any;
  sprint?: any;
  taskId?: any;
  assignees?: any[];
  dependencies?: string[];
  progress?: number;
  isMilestone?: boolean;
  tags?: string[];
  createdBy?: any;
  updatedBy?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarFilters {
  projectId?: string;
  sprintId?: string;
  workspaceId?: string;
  organizationId?: string;
  assigneeId?: string;
  priority?: CalendarEventPriority | 'all';
  status?: CalendarEventStatus | 'all';
  eventType?: CalendarEventType | 'all';
  searchQuery?: string;
  isMilestone?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CalendarEventFormData {
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  color?: string;
  status: CalendarEventStatus;
  priority: CalendarEventPriority;
  projectId?: string;
  sprintId?: string;
  taskId?: string;
  assignees?: string[];
  dependencies?: string[];
  progress?: number;
  isMilestone?: boolean;
  tags?: string[];
}
