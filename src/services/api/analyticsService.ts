import { BaseApiService, ApiResponseData } from './baseApiService';
import { DashboardQuickStats, ProjectHealthMetrics, AnalyticsCharts } from '../../types/dashboard';

export interface ProjectAnalyticsData {
  projectId: string;
  quickStats: DashboardQuickStats;
  health: ProjectHealthMetrics;
  analyticsCharts: AnalyticsCharts;
}

export class AnalyticsService extends BaseApiService {
  /**
   * Fetch project analytics metrics & chart data
   */
  public static async getProjectAnalytics(
    projectId: string
  ): Promise<ApiResponseData<ProjectAnalyticsData>> {
    return this.get<ProjectAnalyticsData>(`/projects/${projectId}/analytics`);
  }
}
