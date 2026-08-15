import { axiosInstance } from './axiosInstance';
import {
  TimeEntry,
  TimeEntryFilterParams,
  TimeEntrySummary,
  TimeReportsData,
  WorkLogFormData,
} from '../../types/timeEntry';

export interface GetTimeEntriesResponse {
  entries: TimeEntry[];
  summary: TimeEntrySummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class TimeEntryService {
  /**
   * Get list of time entries
   */
  public static async getTimeEntries(params: TimeEntryFilterParams = {}): Promise<GetTimeEntriesResponse> {
    const response = await axiosInstance.get('/time-entries', { params });
    return response.data.data;
  }

  /**
   * Get currently running/paused active timer for user
   */
  public static async getActiveTimer(): Promise<TimeEntry | null> {
    const response = await axiosInstance.get('/time-entries/active');
    return response.data.data;
  }

  /**
   * Start timer for a task/project
   */
  public static async startTimer(data: {
    taskId?: string;
    projectId?: string;
    workspaceId?: string;
    organizationId?: string;
    description?: string;
    isBillable?: boolean;
    billableRate?: number;
  }): Promise<TimeEntry> {
    const response = await axiosInstance.post('/time-entries/start', data);
    return response.data.data;
  }

  /**
   * Pause timer
   */
  public static async pauseTimer(id: string): Promise<TimeEntry> {
    const response = await axiosInstance.post(`/time-entries/${id}/pause`);
    return response.data.data;
  }

  /**
   * Resume timer
   */
  public static async resumeTimer(id: string): Promise<TimeEntry> {
    const response = await axiosInstance.post(`/time-entries/${id}/resume`);
    return response.data.data;
  }

  /**
   * Stop timer
   */
  public static async stopTimer(id: string, description?: string): Promise<TimeEntry> {
    const response = await axiosInstance.post(`/time-entries/${id}/stop`, { description });
    return response.data.data;
  }

  /**
   * Cancel timer
   */
  public static async cancelTimer(id: string): Promise<void> {
    await axiosInstance.post(`/time-entries/${id}/cancel`);
  }

  /**
   * Manual work log creation
   */
  public static async createWorkLog(data: WorkLogFormData): Promise<TimeEntry> {
    const response = await axiosInstance.post('/time-entries', data);
    return response.data.data;
  }

  /**
   * Update time entry
   */
  public static async updateTimeEntry(id: string, data: Partial<WorkLogFormData>): Promise<TimeEntry> {
    const response = await axiosInstance.put(`/time-entries/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete time entry
   */
  public static async deleteTimeEntry(id: string): Promise<void> {
    await axiosInstance.delete(`/time-entries/${id}`);
  }

  /**
   * Get time reports analytics
   */
  public static async getTimeReports(params: TimeEntryFilterParams = {}): Promise<TimeReportsData> {
    const response = await axiosInstance.get('/time-entries/reports', { params });
    return response.data.data;
  }

  /**
   * Get timesheet data
   */
  public static async getTimesheet(params: TimeEntryFilterParams = {}): Promise<TimeEntry[]> {
    const response = await axiosInstance.get('/time-entries/timesheet', { params });
    return response.data.data;
  }

  /**
   * Download timesheet export (CSV / JSON)
   */
  public static async exportTimeEntries(format: 'csv' | 'json', params: TimeEntryFilterParams = {}): Promise<void> {
    const response = await axiosInstance.get('/time-entries/export', {
      params: { ...params, format },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `timesheet-export.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}
