export type OrganizationStatus = 'active' | 'archived' | 'suspended';
export type MemberRole = 'owner' | 'admin' | 'member' | 'guest';
export type MemberStatus = 'active' | 'suspended';
export type InviteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  timezone?: string;
  country?: string;
  owner: string;
  status: OrganizationStatus;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organization: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  role: MemberRole;
  joinedAt: string;
  status: MemberStatus;
  invitedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationInvite {
  id: string;
  organization: {
    id: string;
    name: string;
    logo?: string;
    slug: string;
  } | string;
  email: string;
  token: string;
  role: MemberRole;
  status: InviteStatus;
  expiresAt: string;
  invitedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InviteMemberInput {
  email: string;
  role: MemberRole;
}

export interface UpdateMemberRoleInput {
  role: MemberRole;
}

export interface CreateOrganizationInput {
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  timezone?: string;
  country?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  logo?: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  timezone?: string;
  country?: string;
  status?: OrganizationStatus;
  isArchived?: boolean;
}

export interface OrganizationQueryParams {
  search?: string;
  status?: string;
  isArchived?: boolean | string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MemberQueryParams {
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface InviteQueryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface OrganizationsResponseData {
  items: Organization[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

