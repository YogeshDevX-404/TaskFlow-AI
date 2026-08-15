import { axiosInstance } from './axiosInstance';
import {
  ReportFilterParams,
  ExecutiveOverview,
  ProjectHealthItem,
  TaskAnalytics,
  TeamPerformanceItem,
  UserReport,
  SprintReport,
  VelocityItem,
  ActivityAnalytics,
} from '../../types/reports';

export class ReportsService {
  private static cleanParams(params: ReportFilterParams): Record<string, string> {
    const query: Record<string, string> = {};
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query[key] = String(val);
      }
    });
    return query;
  }

  public static async getExecutiveOverview(params: ReportFilterParams): Promise<ExecutiveOverview> {
    const response = await axiosInstance.get('/reports/overview', {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getProjectHealth(params: ReportFilterParams): Promise<ProjectHealthItem[]> {
    const response = await axiosInstance.get('/reports/projects', {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getTaskAnalytics(params: ReportFilterParams): Promise<TaskAnalytics> {
    const response = await axiosInstance.get('/reports/tasks', {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getTeamPerformance(params: ReportFilterParams): Promise<TeamPerformanceItem[]> {
    const response = await axiosInstance.get('/reports/team', {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getUserReport(userId?: string, params: ReportFilterParams = {}): Promise<UserReport | null> {
    const url = userId ? `/reports/users/${userId}` : '/reports/users';
    const response = await axiosInstance.get(url, {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getSprintReport(sprintId?: string, params: ReportFilterParams = {}): Promise<SprintReport> {
    const url = sprintId ? `/reports/sprints/${sprintId}` : '/reports/sprints';
    const response = await axiosInstance.get(url, {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getSprintVelocity(limit = 5, params: ReportFilterParams = {}): Promise<VelocityItem[]> {
    const response = await axiosInstance.get('/reports/velocity', {
      params: { ...this.cleanParams(params), limit },
    });
    return response.data.data;
  }

  public static async getActivityAnalytics(params: ReportFilterParams): Promise<ActivityAnalytics> {
    const response = await axiosInstance.get('/reports/activity', {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async downloadExport(type: string, format: 'csv' | 'json', params: ReportFilterParams) {
    const response = await axiosInstance.get('/reports/export', {
      params: { ...this.cleanParams(params), type, format },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${type}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
