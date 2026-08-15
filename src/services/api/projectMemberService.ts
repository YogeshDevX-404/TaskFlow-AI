import { BaseApiService, ApiResponseData } from './baseApiService';
import {
  ProjectMember,
  AddProjectMemberInput,
  UpdateProjectMemberInput,
  ProjectMemberQueryParams,
} from '../../types/projectMember';

export class ProjectMemberService extends BaseApiService {
  /**
   * Get members for a specific project
   */
  public static async getMembers(
    projectId: string,
    params?: ProjectMemberQueryParams
  ): Promise<ApiResponseData<ProjectMember[]>> {
    return this.get<ProjectMember[]>(`/projects/${projectId}/members`, { params });
  }

  /**
   * Add a new member to project
   */
  public static async addMember(
    projectId: string,
    data: AddProjectMemberInput
  ): Promise<ApiResponseData<ProjectMember>> {
    return this.post<ProjectMember, AddProjectMemberInput>(
      `/projects/${projectId}/members`,
      data
    );
  }

  /**
   * Update project member role or status
   */
  public static async updateMember(
    projectId: string,
    memberId: string,
    data: UpdateProjectMemberInput
  ): Promise<ApiResponseData<ProjectMember>> {
    return this.put<ProjectMember, UpdateProjectMemberInput>(
      `/projects/${projectId}/members/${memberId}`,
      data
    );
  }

  /**
   * Remove member from project
   */
  public static async removeMember(
    projectId: string,
    memberId: string
  ): Promise<ApiResponseData<void>> {
    return this.delete<void>(`/projects/${projectId}/members/${memberId}`);
  }
}
