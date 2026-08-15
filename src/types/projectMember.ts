export type ProjectMemberRole =
  | 'Project Owner'
  | 'Project Admin'
  | 'Developer'
  | 'Tester'
  | 'Viewer';

export type ProjectMemberStatus = 'active' | 'pending' | 'suspended';

export interface ProjectMemberUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  githubUsername?: string;
}

export interface ProjectMemberAddedBy {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProjectMember {
  id: string;
  project: string;
  user: ProjectMemberUser | string;
  organization: string;
  workspace: string;
  role: ProjectMemberRole;
  joinedAt: string;
  addedBy?: ProjectMemberAddedBy | string;
  status: ProjectMemberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AddProjectMemberInput {
  userId?: string;
  email?: string;
  role: ProjectMemberRole;
  status?: ProjectMemberStatus;
}

export interface UpdateProjectMemberInput {
  role?: ProjectMemberRole;
  status?: ProjectMemberStatus;
}

export interface ProjectMemberQueryParams {
  search?: string;
  role?: ProjectMemberRole;
  status?: ProjectMemberStatus;
  tab?: 'members' | 'pending' | 'recent';
  sortBy?: 'name' | 'newest' | 'oldest' | 'role';
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectMemberActivity {
  id: string;
  memberId: string;
  actorName: string;
  actorAvatar?: string;
  type: 'joined' | 'role_changed' | 'status_changed' | 'assigned_task';
  description: string;
  timestamp: string;
}
