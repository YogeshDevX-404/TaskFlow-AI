import { Permission } from '../models/permission.model';
import { Role } from '../models/role.model';

export const DEFAULT_PERMISSIONS = [
  // Organization
  {
    name: 'org:settings:manage',
    description: 'Manage organization settings and details',
    module: 'Organization',
    action: 'manage',
  },
  {
    name: 'org:delete',
    description: 'Delete organization workspace',
    module: 'Organization',
    action: 'delete',
  },
  {
    name: 'org:transfer',
    description: 'Transfer organization ownership',
    module: 'Organization',
    action: 'transfer',
  },

  // Members
  {
    name: 'members:read',
    description: 'View organization members and invitations',
    module: 'Members',
    action: 'read',
  },
  {
    name: 'members:manage',
    description: 'Manage organization member roles and statuses',
    module: 'Members',
    action: 'manage',
  },
  {
    name: 'members:invite',
    description: 'Send invitation emails to new members',
    module: 'Members',
    action: 'invite',
  },
  {
    name: 'members:remove',
    description: 'Remove members from organization',
    module: 'Members',
    action: 'remove',
  },

  // Workspaces
  {
    name: 'workspaces:read',
    description: 'View organization workspaces',
    module: 'Workspaces',
    action: 'read',
  },
  {
    name: 'workspaces:manage',
    description: 'Create, edit, and manage workspaces',
    module: 'Workspaces',
    action: 'manage',
  },
  {
    name: 'workspaces:archive',
    description: 'Archive, restore, or delete workspaces',
    module: 'Workspaces',
    action: 'archive',
  },

  // Projects
  {
    name: 'projects:read',
    description: 'View workspace projects',
    module: 'Projects',
    action: 'read',
  },
  {
    name: 'projects:manage',
    description: 'Create, edit, and manage projects',
    module: 'Projects',
    action: 'manage',
  },
  {
    name: 'projects:archive',
    description: 'Archive or delete projects',
    module: 'Projects',
    action: 'archive',
  },

  // Tasks
  {
    name: 'tasks:read',
    description: 'View project tasks and boards',
    module: 'Tasks',
    action: 'read',
  },
  {
    name: 'tasks:manage',
    description: 'Create, edit, and delete project tasks',
    module: 'Tasks',
    action: 'manage',
  },
  {
    name: 'tasks:assign',
    description: 'Assign tasks to organization members',
    module: 'Tasks',
    action: 'assign',
  },
  {
    name: 'tasks:update',
    description: 'Update assigned task progress and status',
    module: 'Tasks',
    action: 'update',
  },

  // Sprints
  {
    name: 'sprints:manage',
    description: 'Create and manage development sprints',
    module: 'Sprints',
    action: 'manage',
  },

  // Reports
  {
    name: 'reports:view',
    description: 'View organization analytics and reports',
    module: 'Reports',
    action: 'read',
  },

  // Bugs
  {
    name: 'bugs:create',
    description: 'Create and report software bug tickets',
    module: 'Bugs',
    action: 'create',
  },

  // Comments
  {
    name: 'comments:create',
    description: 'Post comments and discussions on tasks',
    module: 'Comments',
    action: 'create',
  },

  // Attachments
  {
    name: 'attachments:upload',
    description: 'Upload files and document attachments',
    module: 'Attachments',
    action: 'upload',
  },

  // Roles & Permissions
  {
    name: 'roles:manage',
    description: 'Manage custom roles and permission matrix',
    module: 'Roles',
    action: 'manage',
  },
];

export async function seedRbacData() {
  try {
    // 1. Seed Permissions
    const permissionDocs = [];
    for (const perm of DEFAULT_PERMISSIONS) {
      let doc = await Permission.findOne({ name: perm.name });
      if (!doc) {
        doc = await Permission.create(perm);
      }
      permissionDocs.push(doc);
    }

    const permMap: Record<string, string> = {};
    permissionDocs.forEach((p) => {
      permMap[p.name] = p._id.toString();
    });

    // Helper to get permission ObjectIds
    const getPermIds = (names: string[]) =>
      names.map((n) => permMap[n]).filter(Boolean);

    // 2. Define System Roles
    const DEFAULT_ROLES = [
      {
        name: 'Owner',
        slug: 'owner',
        description: 'Full administrative access to organization and settings',
        isSystem: true,
        permissions: Object.values(permMap), // All permissions
      },
      {
        name: 'Admin',
        slug: 'admin',
        description: 'Manage members, workspaces, projects, tasks, and organization settings',
        isSystem: true,
        permissions: getPermIds([
          'org:settings:manage',
          'members:read',
          'members:manage',
          'members:invite',
          'members:remove',
          'workspaces:read',
          'workspaces:manage',
          'workspaces:archive',
          'projects:read',
          'projects:manage',
          'projects:archive',
          'tasks:read',
          'tasks:manage',
          'tasks:assign',
          'tasks:update',
          'reports:view',
          'roles:manage',
        ]),
      },
      {
        name: 'Project Manager',
        slug: 'project_manager',
        description: 'Manage workspaces, projects, tasks, sprint planning, and team assignments',
        isSystem: true,
        permissions: getPermIds([
          'workspaces:read',
          'workspaces:manage',
          'projects:read',
          'projects:manage',
          'projects:archive',
          'tasks:read',
          'tasks:manage',
          'tasks:assign',
          'tasks:update',
          'sprints:manage',
          'reports:view',
          'comments:create',
          'attachments:upload',
        ]),
      },
      {
        name: 'Developer',
        slug: 'developer',
        description: 'View assigned workspaces, projects and tasks, update progress, comment, and upload assets',
        isSystem: true,
        permissions: getPermIds([
          'workspaces:read',
          'projects:read',
          'tasks:read',
          'tasks:update',
          'comments:create',
          'attachments:upload',
        ]),
      },
      {
        name: 'Tester',
        slug: 'tester',
        description: 'View workspaces and projects, create bug reports, comment, and upload reproduction assets',
        isSystem: true,
        permissions: getPermIds([
          'workspaces:read',
          'projects:read',
          'tasks:read',
          'bugs:create',
          'comments:create',
          'attachments:upload',
        ]),
      },
      {
        name: 'Viewer',
        slug: 'viewer',
        description: 'Read-only access to organization workspaces, projects and tasks',
        isSystem: true,
        permissions: getPermIds(['workspaces:read', 'projects:read', 'tasks:read']),
      },
    ];

    // Seed default system roles (where organization is null)
    for (const r of DEFAULT_ROLES) {
      let existingRole = await Role.findOne({ slug: r.slug, organization: null });
      if (!existingRole) {
        await Role.create({
          name: r.name,
          slug: r.slug,
          description: r.description,
          isSystem: true,
          organization: null,
          permissions: r.permissions,
        });
      } else {
        // Update system role permissions to ensure up-to-date mappings
        existingRole.permissions = r.permissions as any;
        await existingRole.save();
      }
    }
    console.log('RBAC Permissions & System Roles initialized successfully.');
  } catch (err) {
    console.error('Error seeding RBAC data:', err);
  }
}
