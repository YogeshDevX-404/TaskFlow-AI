import { BaseApiService, ApiResponseData } from './baseApiService';
import { ProjectDashboardData } from '../../types/dashboard';

export class DashboardService extends BaseApiService {
  /**
   * Fetch complete dashboard overview for a given project
   */
  public static async getProjectDashboard(
    projectId: string
  ): Promise<ApiResponseData<ProjectDashboardData>> {
    return this.get<ProjectDashboardData>(`/projects/${projectId}/dashboard`);
  }
}
