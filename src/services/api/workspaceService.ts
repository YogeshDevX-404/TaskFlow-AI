import { BaseApiService, ApiResponseData } from './baseApiService';
import {
  Workspace,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  WorkspaceQueryParams,
} from '../../types/workspace';

export class WorkspaceService extends BaseApiService {
  /**
   * Fetch organization workspaces
   */
  public static async getWorkspaces(
    params?: WorkspaceQueryParams
  ): Promise<ApiResponseData<Workspace[]>> {
    return this.get<Workspace[]>('/workspaces', { params });
  }

  /**
   * Get single workspace details
   */
  public static async getWorkspaceById(
    idOrSlug: string
  ): Promise<ApiResponseData<Workspace>> {
    return this.get<Workspace>(`/workspaces/${idOrSlug}`);
  }

  /**
   * Create a workspace
   */
  public static async createWorkspace(
    data: CreateWorkspaceInput
  ): Promise<ApiResponseData<Workspace>> {
    return this.post<Workspace, CreateWorkspaceInput>('/workspaces', data);
  }

  /**
   * Update workspace
   */
  public static async updateWorkspace(
    id: string,
    data: UpdateWorkspaceInput
  ): Promise<ApiResponseData<Workspace>> {
    return this.put<Workspace, UpdateWorkspaceInput>(`/workspaces/${id}`, data);
  }

  /**
   * Delete workspace
   */
  public static async deleteWorkspace(id: string): Promise<ApiResponseData<void>> {
    return this.delete<void>(`/workspaces/${id}`);
  }

  /**
   * Archive workspace
   */
  public static async archiveWorkspace(id: string): Promise<ApiResponseData<Workspace>> {
    return this.patch<Workspace>(`/workspaces/${id}/archive`);
  }

  /**
   * Restore workspace
   */
  public static async restoreWorkspace(id: string): Promise<ApiResponseData<Workspace>> {
    return this.patch<Workspace>(`/workspaces/${id}/restore`);
  }

  /**
   * Toggle favorite
   */
  public static async toggleFavorite(id: string): Promise<ApiResponseData<Workspace>> {
    return this.patch<Workspace>(`/workspaces/${id}/favorite`);
  }

  /**
   * Toggle pin
   */
  public static async togglePin(id: string): Promise<ApiResponseData<Workspace>> {
    return this.patch<Workspace>(`/workspaces/${id}/pin`);
  }

  /**
   * Duplicate workspace
   */
  public static async duplicateWorkspace(
    id: string,
    name?: string
  ): Promise<ApiResponseData<Workspace>> {
    return this.post<Workspace, { name?: string }>(`/workspaces/${id}/duplicate`, { name });
  }
}
