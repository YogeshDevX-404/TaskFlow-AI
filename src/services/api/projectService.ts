import { BaseApiService, ApiResponseData } from './baseApiService';
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryParams,
} from '../../types/project';

export class ProjectService extends BaseApiService {
  /**
   * Fetch projects with filters
   */
  public static async getProjects(
    params?: ProjectQueryParams
  ): Promise<ApiResponseData<Project[]>> {
    return this.get<Project[]>('/projects', { params });
  }

  /**
   * Get single project details
   */
  public static async getProjectById(
    id: string
  ): Promise<ApiResponseData<Project>> {
    return this.get<Project>(`/projects/${id}`);
  }

  /**
   * Create a project
   */
  public static async createProject(
    data: CreateProjectInput
  ): Promise<ApiResponseData<Project>> {
    return this.post<Project, CreateProjectInput>('/projects', data);
  }

  /**
   * Update project
   */
  public static async updateProject(
    id: string,
    data: UpdateProjectInput
  ): Promise<ApiResponseData<Project>> {
    return this.put<Project, UpdateProjectInput>(`/projects/${id}`, data);
  }

  /**
   * Delete project
   */
  public static async deleteProject(id: string): Promise<ApiResponseData<void>> {
    return this.delete<void>(`/projects/${id}`);
  }

  /**
   * Archive project
   */
  public static async archiveProject(id: string): Promise<ApiResponseData<Project>> {
    return this.patch<Project>(`/projects/${id}/archive`);
  }

  /**
   * Restore project
   */
  public static async restoreProject(id: string): Promise<ApiResponseData<Project>> {
    return this.patch<Project>(`/projects/${id}/restore`);
  }

  /**
   * Toggle favorite
   */
  public static async toggleFavorite(id: string): Promise<ApiResponseData<Project>> {
    return this.patch<Project>(`/projects/${id}/favorite`);
  }

  /**
   * Toggle pin
   */
  public static async togglePin(id: string): Promise<ApiResponseData<Project>> {
    return this.patch<Project>(`/projects/${id}/pin`);
  }

  /**
   * Duplicate project
   */
  public static async duplicateProject(
    id: string,
    name?: string
  ): Promise<ApiResponseData<Project>> {
    return this.post<Project, { name?: string }>(`/projects/${id}/duplicate`, { name });
  }
}
