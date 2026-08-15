import { axiosInstance } from './axiosInstance';
import {
  Permission,
  Role,
  CreateRoleInput,
  UpdateRoleInput,
  DuplicateRoleInput,
} from '../../types/rbac';

export class RbacService {
  /**
   * Get all system permissions
   */
  public static async getPermissions(): Promise<Permission[]> {
    const response = await axiosInstance.get('/permissions');
    return response.data.data;
  }

  /**
   * Get all roles for an organization (system + custom roles)
   */
  public static async getRoles(organizationId?: string): Promise<Role[]> {
    const response = await axiosInstance.get('/roles', {
      params: { organizationId },
      headers: organizationId ? { 'X-Organization-Id': organizationId } : {},
    });
    return response.data.data;
  }

  /**
   * Get single role by ID
   */
  public static async getRoleById(roleId: string, organizationId?: string): Promise<Role> {
    const response = await axiosInstance.get(`/roles/${roleId}`, {
      params: { organizationId },
      headers: organizationId ? { 'X-Organization-Id': organizationId } : {},
    });
    return response.data.data;
  }

  /**
   * Create a new custom role
   */
  public static async createRole(input: CreateRoleInput): Promise<Role> {
    const response = await axiosInstance.post('/roles', input, {
      headers: { 'X-Organization-Id': input.organizationId },
    });
    return response.data.data;
  }

  /**
   * Update a role (name, description, permissions)
   */
  public static async updateRole(roleId: string, input: UpdateRoleInput): Promise<Role> {
    const response = await axiosInstance.put(`/roles/${roleId}`, input, {
      headers: { 'X-Organization-Id': input.organizationId },
    });
    return response.data.data;
  }

  /**
   * Delete custom role
   */
  public static async deleteRole(roleId: string, organizationId: string): Promise<void> {
    await axiosInstance.delete(`/roles/${roleId}`, {
      params: { organizationId },
      headers: { 'X-Organization-Id': organizationId },
    });
  }

  /**
   * Duplicate role
   */
  public static async duplicateRole(
    roleId: string,
    input: DuplicateRoleInput
  ): Promise<Role> {
    const response = await axiosInstance.post(`/roles/${roleId}/duplicate`, input, {
      headers: { 'X-Organization-Id': input.organizationId },
    });
    return response.data.data;
  }
}
