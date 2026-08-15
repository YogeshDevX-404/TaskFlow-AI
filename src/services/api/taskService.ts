import { BaseApiService, ApiResponseData } from './baseApiService';
import {
  Task,
  TaskFormData,
  TaskFilters,
  TaskSortOption,
  TaskStatus,
  TaskPriority,
  TaskType,
} from '../../types/task';

export interface TaskQueryParams {
  organizationId?: string;
  workspaceId?: string;
  projectId?: string;
  assigneeId?: string;
  reporterId?: string;
  search?: string;
  status?: TaskStatus | string;
  priority?: TaskPriority | string;
  type?: TaskType | string;
  labels?: string;
  isArchived?: boolean;
  isFavorite?: boolean;
  sortBy?: TaskSortOption | string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class TaskService extends BaseApiService {
  /**
   * Fetch tasks with filters
   */
  public static async getTasks(
    params?: TaskQueryParams
  ): Promise<ApiResponseData<Task[]>> {
    return this.get<Task[]>('/tasks', { params });
  }

  /**
   * Get single task details
   */
  public static async getTaskById(id: string): Promise<ApiResponseData<Task>> {
    return this.get<Task>(`/tasks/${id}`);
  }

  /**
   * Get complete task details
   */
  public static async getTaskDetails(id: string): Promise<ApiResponseData<Task>> {
    return this.get<Task>(`/tasks/${id}/details`);
  }

  /**
   * Create a new task
   */
  public static async createTask(
    data: TaskFormData
  ): Promise<ApiResponseData<Task>> {
    return this.post<Task, TaskFormData>('/tasks', data);
  }

  /**
   * Update task
   */
  public static async updateTask(
    id: string,
    data: Partial<TaskFormData> & { isArchived?: boolean }
  ): Promise<ApiResponseData<Task>> {
    return this.put<Task, Partial<TaskFormData>>(`/tasks/${id}`, data);
  }

  /**
   * Delete task
   */
  public static async deleteTask(id: string): Promise<ApiResponseData<void>> {
    return this.delete<void>(`/tasks/${id}`);
  }

  /**
   * Archive task
   */
  public static async archiveTask(id: string): Promise<ApiResponseData<Task>> {
    return this.patch<Task, Record<string, unknown>>(`/tasks/${id}/archive`, {});
  }

  /**
   * Restore task
   */
  public static async restoreTask(id: string): Promise<ApiResponseData<Task>> {
    return this.patch<Task, Record<string, unknown>>(`/tasks/${id}/restore`, {});
  }

  /**
   * Duplicate task
   */
  public static async duplicateTask(id: string): Promise<ApiResponseData<Task>> {
    return this.post<Task, Record<string, unknown>>(`/tasks/${id}/duplicate`, {});
  }

  /**
   * Toggle favorite
   */
  public static async toggleFavorite(id: string): Promise<ApiResponseData<Task>> {
    return this.patch<Task, Record<string, unknown>>(`/tasks/${id}/favorite`, {});
  }

  /**
   * Toggle watch
   */
  public static async toggleWatch(id: string): Promise<ApiResponseData<Task>> {
    return this.patch<Task, Record<string, unknown>>(`/tasks/${id}/watch`, {});
  }
}
