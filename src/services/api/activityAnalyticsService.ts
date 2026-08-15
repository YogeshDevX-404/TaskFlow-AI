import { axiosInstance } from './axiosInstance';
import {
  ActivityAnalyticsFilters,
  DeveloperActivityOverviewResponse,
  DeveloperLeaderboardResponse,
  DeveloperDeepDiveResponse,
  RepositoryActivityResponse,
} from '../../types/activityAnalytics';

export const activityAnalyticsService = {
  /**
   * Fetch aggregate developer activity overview metrics
   */
  async getOverview(filters: ActivityAnalyticsFilters = {}): Promise<DeveloperActivityOverviewResponse> {
    const params = new URLSearchParams();
    if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.repositoryId) params.append('repositoryId', filters.repositoryId);
    if (filters.timeRange) params.append('timeRange', filters.timeRange);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const res = await axiosInstance.get(`/activity/analytics/overview?${params.toString()}`);
    return res.data.data;
  },

  /**
   * Fetch developer leaderboard and contribution statistics
   */
  async getDevelopers(filters: ActivityAnalyticsFilters = {}): Promise<DeveloperLeaderboardResponse> {
    const params = new URLSearchParams();
    if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.repositoryId) params.append('repositoryId', filters.repositoryId);
    if (filters.timeRange) params.append('timeRange', filters.timeRange);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const res = await axiosInstance.get(`/activity/analytics/developers?${params.toString()}`);
    return res.data.data;
  },

  /**
   * Fetch deep dive analytics for a single developer (Heatmap, PRs, Commits, Work Patterns)
   */
  async getDeveloperDeepDive(
    userId: string,
    filters: ActivityAnalyticsFilters = {}
  ): Promise<DeveloperDeepDiveResponse> {
    const params = new URLSearchParams();
    if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.repositoryId) params.append('repositoryId', filters.repositoryId);
    if (filters.timeRange) params.append('timeRange', filters.timeRange);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const res = await axiosInstance.get(`/activity/analytics/developers/${userId}?${params.toString()}`);
    return res.data.data;
  },

  /**
   * Fetch repository level activity analytics
   */
  async getRepositoryAnalytics(filters: ActivityAnalyticsFilters = {}): Promise<RepositoryActivityResponse> {
    const params = new URLSearchParams();
    if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.timeRange) params.append('timeRange', filters.timeRange);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const res = await axiosInstance.get(`/activity/analytics/repositories?${params.toString()}`);
    return res.data.data;
  },

  /**
   * Export activity analytics to CSV or JSON
   */
  async exportAnalytics(filters: ActivityAnalyticsFilters = {}, format: 'csv' | 'json' = 'csv'): Promise<void> {
    const params = new URLSearchParams();
    if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.repositoryId) params.append('repositoryId', filters.repositoryId);
    if (filters.timeRange) params.append('timeRange', filters.timeRange);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    params.append('format', format);

    const response = await axiosInstance.get(`/activity/analytics/export?${params.toString()}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8;',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `developer_activity_${new Date().toISOString().slice(0, 10)}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
