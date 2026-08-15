export type TimeEntrySource = 'Manual' | 'Timer' | 'Imported';
export type TimeEntryStatus = 'running' | 'paused' | 'stopped';

export interface TimeEntryUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface TimeEntryTask {
  id: string;
  title: string;
  taskKey: string;
  status?: string;
  priority?: string;
  estimatedHours?: number;
  spentHours?: number;
}

export interface TimeEntryProject {
  id: string;
  name: string;
  key: string;
}

export interface TimeEntryWorkspace {
  id: string;
  name: string;
}

export interface TimeEntry {
  id: string;
  user: TimeEntryUser | string;
  organization?: string;
  workspace?: TimeEntryWorkspace | string;
  project?: TimeEntryProject | string;
  task?: TimeEntryTask | string;
  assignment?: string | any;
  assignmentId?: string;
  description: string;
  startTime: string;
  endTime?: string | null;
  duration: number; // in seconds
  isBillable: boolean;
  billableRate: number;
  source: TimeEntrySource;
  status: TimeEntryStatus;
  pausedAt?: string | null;
  accumulatedTime: number; // in seconds
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntrySummary {
  totalDuration: number; // seconds
  billableDuration: number; // seconds
  nonBillableDuration: number; // seconds
  totalBillableAmount: number;
}

export interface TimeEntryFilterParams {
  userId?: string;
  projectId?: string;
  taskId?: string;
  workspaceId?: string;
  organizationId?: string;
  startDate?: string;
  endDate?: string;
  isBillable?: boolean;
  source?: TimeEntrySource;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface TimeReportMemberStats {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  totalHours: number;
  billableHours: number;
  entryCount: number;
}

export interface TimeReportTaskStats {
  taskId: string;
  title: string;
  taskKey: string;
  estimatedHours: number;
  actualHours: number;
  billableHours: number;
  remainingHours: number;
  entryCount: number;
}

export interface TimeReportDailyTrend {
  date: string;
  totalHours: number;
  billableHours: number;
}

export interface TimeReportOverview {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalEntries: number;
  totalBillableAmount: number;
}

export interface TimeReportsData {
  overview: TimeReportOverview;
  byMember: TimeReportMemberStats[];
  byTask: TimeReportTaskStats[];
  dailyTrend: TimeReportDailyTrend[];
}

export interface WorkLogFormData {
  taskId?: string;
  projectId?: string;
  workspaceId?: string;
  organizationId?: string;
  description: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: number; // minutes or seconds
  isBillable: boolean;
  billableRate: number;
}
