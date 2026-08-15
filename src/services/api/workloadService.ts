import { axiosInstance } from './axiosInstance';
import {
  WorkloadFilterParams,
  TeamWorkloadSummary,
  MemberWorkload,
  ProjectWorkload,
  WorkloadCalendarEntry,
  OverloadedMember,
  UpcomingTask,
  OverdueTask,
  WorkloadRecommendation,
  MemberCapacityConfig,
} from '../../types/workload';

export class WorkloadService {
  private static cleanParams(params: WorkloadFilterParams): Record<string, string> {
    const query: Record<string, string> = {};
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query[key] = String(val);
      }
    });
    return query;
  }

  public static async getWorkloadOverview(
    params: WorkloadFilterParams = {}
  ): Promise<{ teamSummary: TeamWorkloadSummary }> {
    const response = await axiosInstance.get('/workload', {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getTeamWorkload(
    params: WorkloadFilterParams = {}
  ): Promise<{ members: MemberWorkload[]; totalMembers: number }> {
    const response = await axiosInstance.get('/workload/team', {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getMemberWorkload(
    userId: string,
    params: WorkloadFilterParams = {}
  ): Promise<{ member: any; capacity: any; stats: any; tasks: any[] }> {
    const response = await axiosInstance.get(`/workload/members/${userId}`, {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getProjectWorkload(
    projectId: string,
    params: WorkloadFilterParams = {}
  ): Promise<ProjectWorkload> {
    const response = await axiosInstance.get(`/workload/projects/${projectId}`, {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getWorkloadCalendar(
    params: WorkloadFilterParams = {}
  ): Promise<{ calendar: WorkloadCalendarEntry[] }> {
    const response = await axiosInstance.get('/workload/calendar', {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getOverloadedMembers(
    params: WorkloadFilterParams = {}
  ): Promise<{ overloadedMembers: OverloadedMember[]; totalOverloaded: number }> {
    const response = await axiosInstance.get('/workload/overloaded', {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getUpcomingWork(
    params: WorkloadFilterParams = {}
  ): Promise<{ timeframeDays: number; tasks: UpcomingTask[]; totalTasks: number }> {
    const response = await axiosInstance.get('/workload/upcoming', {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getOverdueWork(
    params: WorkloadFilterParams = {}
  ): Promise<{ tasks: OverdueTask[]; totalOverdue: number }> {
    const response = await axiosInstance.get('/workload/overdue', {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getWorkloadRecommendations(
    params: WorkloadFilterParams = {}
  ): Promise<{ recommendations: WorkloadRecommendation[]; totalRecommendations: number }> {
    const response = await axiosInstance.get('/workload/recommendations', {
      params: this.cleanParams(params),
    });
    return response.data.data;
  }

  public static async getMemberCapacity(
    userId: string,
    organizationId?: string
  ): Promise<MemberCapacityConfig> {
    const response = await axiosInstance.get(`/workload/members/${userId}/capacity`, {
      params: organizationId ? { organizationId } : {},
    });
    return response.data.data;
  }

  public static async updateMemberCapacity(
    userId: string,
    capacityData: Partial<MemberCapacityConfig>
  ): Promise<MemberCapacityConfig> {
    const response = await axiosInstance.put(
      `/workload/members/${userId}/capacity`,
      capacityData
    );
    return response.data.data;
  }

  public static async reassignTasksBulk(payload: {
    taskIds: string[];
    targetAssigneeId: string | null;
    organizationId?: string;
  }): Promise<{ modifiedCount: number }> {
    const response = await axiosInstance.post('/workload/reassign-bulk', payload);
    return response.data.data;
  }
}
