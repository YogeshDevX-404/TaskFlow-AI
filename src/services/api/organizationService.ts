import { BaseApiService, ApiResponseData } from './baseApiService';
import {
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationQueryParams,
} from '../../types/organization';

export class OrganizationService extends BaseApiService {
  /**
   * Fetch user's organizations with filters & pagination
   */
  public static async getOrganizations(
    params?: OrganizationQueryParams
  ): Promise<ApiResponseData<Organization[]>> {
    return this.get<Organization[]>('/organizations', { params });
  }

  /**
   * Get single organization details by ID or Slug
   */
  public static async getOrganizationById(
    idOrSlug: string
  ): Promise<ApiResponseData<Organization>> {
    return this.get<Organization>(`/organizations/${idOrSlug}`);
  }

  /**
   * Create a new organization
   */
  public static async createOrganization(
    data: CreateOrganizationInput
  ): Promise<ApiResponseData<Organization>> {
    return this.post<Organization, CreateOrganizationInput>('/organizations', data);
  }

  /**
   * Update organization details
   */
  public static async updateOrganization(
    id: string,
    data: UpdateOrganizationInput
  ): Promise<ApiResponseData<Organization>> {
    return this.put<Organization, UpdateOrganizationInput>(`/organizations/${id}`, data);
  }

  /**
   * Archive organization
   */
  public static async archiveOrganization(
    id: string
  ): Promise<ApiResponseData<Organization>> {
    return this.patch<Organization>(`/organizations/${id}/archive`);
  }

  /**
   * Restore organization
   */
  public static async restoreOrganization(
    id: string
  ): Promise<ApiResponseData<Organization>> {
    return this.patch<Organization>(`/organizations/${id}/restore`);
  }

  /**
   * Delete organization permanently
   */
  public static async deleteOrganization(
    id: string
  ): Promise<ApiResponseData<void>> {
    return this.delete<void>(`/organizations/${id}`);
  }
}
