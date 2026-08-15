import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ResponseService } from '../services/response.service';

export class DashboardController {
  /**
   * GET /api/v1/projects/:projectId/dashboard
   * Returns project dashboard overview & analytics data
   */
  public static async getDashboard(req: Request, res: Response): Promise<void> {
    const { projectId } = req.params;
    const dashboardData = await DashboardService.getProjectDashboard(projectId);
    ResponseService.success(res, 'Project dashboard data retrieved successfully', dashboardData);
  }

  /**
   * GET /api/v1/projects/:projectId/analytics
   * Returns project analytics data
   */
  public static async getAnalytics(req: Request, res: Response): Promise<void> {
    const { projectId } = req.params;
    const analyticsData = await DashboardService.getProjectAnalytics(projectId);
    ResponseService.success(res, 'Project analytics retrieved successfully', analyticsData);
  }
}
