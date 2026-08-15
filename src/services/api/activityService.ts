import { axiosInstance } from './axiosInstance';
import { ActivityFilters, ActivityResponse, ExportFormat } from '../../types/activity';

export const activityService = {
  /**
   * Fetch organization activity logs & timeline
   */
  async getActivities(filters: ActivityFilters = {}): Promise<ActivityResponse> {
    const params = new URLSearchParams();
    if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.taskId) params.append('taskId', filters.taskId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.actionType && filters.actionType !== 'all') params.append('actionType', filters.actionType);
    if (filters.entityType && filters.entityType !== 'all') params.append('entityType', filters.entityType);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.grouped) params.append('grouped', 'true');

    const res = await axiosInstance.get(`/activity?${params.toString()}`);
    return res.data.data;
  },

  /**
   * Fetch task-specific activity timeline
   */
  async getTaskActivity(taskId: string, filters: ActivityFilters = {}): Promise<ActivityResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const res = await axiosInstance.get(`/tasks/${taskId}/activity?${params.toString()}`);
    return res.data.data;
  },

  /**
   * Fetch project-specific activity timeline
   */
  async getProjectActivity(projectId: string, filters: ActivityFilters = {}): Promise<ActivityResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const res = await axiosInstance.get(`/projects/${projectId}/activity?${params.toString()}`);
    return res.data.data;
  },

  /**
   * Fetch workspace-specific activity timeline
   */
  async getWorkspaceActivity(workspaceId: string, filters: ActivityFilters = {}): Promise<ActivityResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const res = await axiosInstance.get(`/workspaces/${workspaceId}/activity?${params.toString()}`);
    return res.data.data;
  },

  /**
   * Export activity audit logs
   */
  async exportActivities(filters: ActivityFilters = {}, format: ExportFormat = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.taskId) params.append('taskId', filters.taskId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.actionType && filters.actionType !== 'all') params.append('actionType', filters.actionType);
    if (filters.entityType && filters.entityType !== 'all') params.append('entityType', filters.entityType);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const res = await axiosInstance.get(`/activity/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
