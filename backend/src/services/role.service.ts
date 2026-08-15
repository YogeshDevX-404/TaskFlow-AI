import { Role, IRolePayload } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { OrganizationMember } from '../models/organizationMember.model';
import { Types } from 'mongoose';

export class RoleService {
  /**
   * Get all permissions available in the system
   */
  public static async getAllPermissions() {
    const permissions = await Permission.find().sort({ module: 1, name: 1 });
    return permissions.map((p) => p.toPermissionPayload());
  }

  /**
   * Get all roles available for an organization (system roles + custom org roles)
   */
  public static async getRolesForOrganization(organizationId?: string): Promise<IRolePayload[]> {
    let query: any = { organization: null }; // System default roles

    if (organizationId && Types.ObjectId.isValid(organizationId)) {
      query = {
        $or: [{ organization: null }, { organization: new Types.ObjectId(organizationId) }],
      };
    }

    const roles = await Role.find(query)
      .populate('permissions')
      .sort({ isSystem: -1, name: 1 });

    return roles.map((r) => r.toRolePayload());
  }

  /**
   * Get a single role by ID or slug
   */
  public static async getRoleById(roleId: string, organizationId?: string) {
    let role = null;
    if (Types.ObjectId.isValid(roleId)) {
      role = await Role.findById(roleId).populate('permissions');
    }
    if (!role) {
      role = await Role.findOne({
        slug: roleId,
        $or: [{ organization: null }, ...(organizationId ? [{ organization: organizationId }] : [])],
      }).populate('permissions');
    }

    if (!role) {
      throw new Error('Role not found.');
    }

    return role.toRolePayload();
  }

  /**
   * Create a new custom role for an organization
   */
  public static async createRole(data: {
    name: string;
    description?: string;
    permissions: string[]; // array of Permission IDs or permission names
    organizationId: string;
  }): Promise<IRolePayload> {
    const { name, description, permissions, organizationId } = data;

    if (!organizationId) {
      throw new Error('Organization ID is required to create a custom role.');
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    // Check for duplicate role name in the same organization
    const existing = await Role.findOne({
      organization: organizationId,
      $or: [{ name: { $regex: new RegExp(`^${name}$`, 'i') } }, { slug }],
    });

    if (existing) {
      throw new Error(`A role with the name "${name}" already exists in this organization.`);
    }

    // Resolve permission IDs
    const resolvedPermissionIds = await this.resolvePermissionIds(permissions);

    const newRole = await Role.create({
      name: name.trim(),
      slug,
      description: description ? description.trim() : '',
      permissions: resolvedPermissionIds,
      organization: organizationId,
      isSystem: false,
    });

    await newRole.populate('permissions');
    return newRole.toRolePayload();
  }

  /**
   * Update an existing custom or system role
   */
  public static async updateRole(
    roleId: string,
    data: {
      name?: string;
      description?: string;
      permissions?: string[];
    },
    organizationId: string,
    operatorUserId: string
  ): Promise<IRolePayload> {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error('Role not found.');
    }

    // Prevent modifying system roles' basic identities, but custom roles or permissions can be edited
    if (role.isSystem && role.slug === 'owner') {
      throw new Error('The system Owner role cannot be modified.');
    }

    if (role.isSystem && data.name && data.name.toLowerCase() !== role.name.toLowerCase()) {
      throw new Error('System role names cannot be renamed.');
    }

    // Validate duplicate custom role names
    if (data.name && !role.isSystem && data.name.toLowerCase() !== role.name.toLowerCase()) {
      const duplicate = await Role.findOne({
        _id: { $ne: role._id },
        organization: organizationId,
        name: { $regex: new RegExp(`^${data.name}$`, 'i') },
      });
      if (duplicate) {
        throw new Error(`A role with the name "${data.name}" already exists.`);
      }
      role.name = data.name.trim();
      role.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    }

    if (data.description !== undefined) {
      role.description = data.description.trim();
    }

    if (data.permissions) {
      // Prevent removing essential permissions from own active role if operator is updating their own role
      const resolvedPermissionIds = await this.resolvePermissionIds(data.permissions);
      role.permissions = resolvedPermissionIds as any;
    }

    await role.save();
    await role.populate('permissions');
    return role.toRolePayload();
  }

  /**
   * Delete a custom role
   */
  public static async deleteRole(roleId: string, organizationId: string): Promise<void> {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error('Role not found.');
    }

    if (role.isSystem) {
      throw new Error('System roles cannot be deleted.');
    }

    if (role.organization?.toString() !== organizationId) {
      throw new Error('You do not have permission to delete this role.');
    }

    // Check if members are assigned to this custom role
    const assignedMembersCount = await OrganizationMember.countDocuments({
      organization: organizationId,
      role: { $in: [role._id.toString(), role.slug, role.name] },
    });

    if (assignedMembersCount > 0) {
      throw new Error(
        `Cannot delete role "${role.name}" because it is currently assigned to ${assignedMembersCount} member(s). Please reassign members before deleting.`
      );
    }

    await Role.findByIdAndDelete(roleId);
  }

  /**
   * Duplicate an existing role into a new custom role
   */
  public static async duplicateRole(
    roleId: string,
    newRoleName: string,
    organizationId: string
  ): Promise<IRolePayload> {
    const sourceRole = await Role.findById(roleId).populate('permissions');
    if (!sourceRole) {
      throw new Error('Source role not found.');
    }

    const targetName = newRoleName ? newRoleName.trim() : `${sourceRole.name} (Copy)`;
    const permissionIds = sourceRole.permissions.map((p: any) =>
      typeof p === 'object' && p._id ? p._id.toString() : p.toString()
    );

    return this.createRole({
      name: targetName,
      description: `Copy of ${sourceRole.name}. ${sourceRole.description || ''}`,
      permissions: permissionIds,
      organizationId,
    });
  }

  /**
   * Helper: Resolve permission IDs from a list of IDs or permission names
   */
  private static async resolvePermissionIds(permissionInputs: string[]): Promise<Types.ObjectId[]> {
    const validObjectIds: Types.ObjectId[] = [];
    const nameQueries: string[] = [];

    permissionInputs.forEach((input) => {
      if (Types.ObjectId.isValid(input)) {
        validObjectIds.push(new Types.ObjectId(input));
      } else {
        nameQueries.push(input);
      }
    });

    if (nameQueries.length > 0) {
      const foundPerms = await Permission.find({ name: { $in: nameQueries } });
      foundPerms.forEach((p) => validObjectIds.push(p._id as Types.ObjectId));
    }

    return validObjectIds;
  }
}
