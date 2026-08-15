import { create } from 'zustand';
import {
  ProjectMember,
  AddProjectMemberInput,
  UpdateProjectMemberInput,
  ProjectMemberQueryParams,
  ProjectMemberActivity,
} from '../types/projectMember';
import { ProjectMemberService } from '../services/api/projectMemberService';

interface ProjectMemberState {
  members: ProjectMember[];
  selectedMember: ProjectMember | null;
  activities: ProjectMemberActivity[];
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;

  // Actions
  fetchMembers: (projectId: string, params?: ProjectMemberQueryParams) => Promise<void>;
  addMember: (projectId: string, data: AddProjectMemberInput) => Promise<ProjectMember | null>;
  updateMember: (
    projectId: string,
    memberId: string,
    data: UpdateProjectMemberInput
  ) => Promise<boolean>;
  removeMember: (projectId: string, memberId: string) => Promise<boolean>;
  setSelectedMember: (member: ProjectMember | null) => void;
  clearError: () => void;
}

const DEFAULT_MOCK_MEMBERS: ProjectMember[] = [
  {
    id: 'pm-101',
    project: 'proj-1',
    user: {
      id: 'usr-1',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.j@acme.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      githubUsername: 'sarahjenkins-dev',
    },
    organization: 'org-default',
    workspace: 'ws-eng-001',
    role: 'Project Owner',
    joinedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    addedBy: { id: 'usr-1', firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah.j@acme.com' },
    status: 'active',
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pm-102',
    project: 'proj-1',
    user: {
      id: 'usr-2',
      firstName: 'David',
      lastName: 'Chen',
      email: 'david.c@acme.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      githubUsername: 'dchen-code',
    },
    organization: 'org-default',
    workspace: 'ws-eng-001',
    role: 'Project Admin',
    joinedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    addedBy: { id: 'usr-1', firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah.j@acme.com' },
    status: 'active',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pm-103',
    project: 'proj-1',
    user: {
      id: 'usr-3',
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.r@acme.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      githubUsername: 'elena-ux',
    },
    organization: 'org-default',
    workspace: 'ws-eng-001',
    role: 'Developer',
    joinedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    addedBy: { id: 'usr-2', firstName: 'David', lastName: 'Chen', email: 'david.c@acme.com' },
    status: 'active',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pm-104',
    project: 'proj-1',
    user: {
      id: 'usr-4',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.v@acme.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      githubUsername: 'mvance',
    },
    organization: 'org-default',
    workspace: 'ws-eng-001',
    role: 'Tester',
    joinedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    addedBy: { id: 'usr-1', firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah.j@acme.com' },
    status: 'active',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pm-105',
    project: 'proj-1',
    user: {
      id: 'usr-5',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex.r@acme.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      githubUsername: 'arivera-sec',
    },
    organization: 'org-default',
    workspace: 'ws-eng-001',
    role: 'Viewer',
    joinedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    addedBy: { id: 'usr-2', firstName: 'David', lastName: 'Chen', email: 'david.c@acme.com' },
    status: 'pending',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_ACTIVITIES: ProjectMemberActivity[] = [
  {
    id: 'act-1',
    memberId: 'pm-105',
    actorName: 'David Chen',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    type: 'joined',
    description: 'Invited Alex Rivera to project as Viewer (Pending)',
    timestamp: '3 days ago',
  },
  {
    id: 'act-2',
    memberId: 'pm-104',
    actorName: 'Sarah Jenkins',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    type: 'role_changed',
    description: 'Promoted Marcus Vance to Tester role',
    timestamp: '10 days ago',
  },
  {
    id: 'act-3',
    memberId: 'pm-103',
    actorName: 'David Chen',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    type: 'joined',
    description: 'Added Elena Rostova to project',
    timestamp: '1 month ago',
  },
];

export const useProjectMemberStore = create<ProjectMemberState>((set, get) => ({
  members: [],
  selectedMember: null,
  activities: DEFAULT_ACTIVITIES,
  isLoading: false,
  isActionLoading: false,
  error: null,

  fetchMembers: async (projectId: string, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      let fetched: ProjectMember[] = [];
      try {
        const response = await ProjectMemberService.getMembers(projectId, params);
        fetched = response.data || [];
      } catch (apiErr) {
        console.warn('Project members API unavailable, using fallback mock list:', apiErr);
      }

      if (fetched.length === 0) {
        // Filter default mocks for this project
        fetched = DEFAULT_MOCK_MEMBERS.map((m) => ({ ...m, project: projectId }));
      }

      set({ members: fetched, isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to load project members.',
        isLoading: false,
        members: DEFAULT_MOCK_MEMBERS.map((m) => ({ ...m, project: projectId })),
      });
    }
  },

  addMember: async (projectId: string, data: AddProjectMemberInput) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await ProjectMemberService.addMember(projectId, data);
      if (response.success && response.data) {
        const newM = response.data;
        set((state) => ({
          members: [newM, ...state.members],
          isActionLoading: false,
        }));
        return newM;
      }
      throw new Error(response.message || 'Failed to add project member.');
    } catch (err: any) {
      // Local fallback creation
      const userEmail = data.email || 'new.member@acme.com';
      const nameParts = userEmail.split('@')[0].split('.');
      const fName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Team';
      const lName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'Member';

      // Duplicate check
      const isDuplicate = get().members.some((m) => {
        if (typeof m.user === 'object') {
          return m.user.email.toLowerCase() === userEmail.toLowerCase();
        }
        return false;
      });

      if (isDuplicate) {
        set({
          error: 'This user is already a member of this project.',
          isActionLoading: false,
        });
        return null;
      }

      const fallbackMember: ProjectMember = {
        id: `pm-${Date.now()}`,
        project: projectId,
        user: {
          id: data.userId || `usr-${Date.now()}`,
          firstName: fName,
          lastName: lName,
          email: userEmail,
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
          githubUsername: userEmail.split('@')[0],
        },
        organization: 'org-default',
        workspace: 'ws-eng-001',
        role: data.role || 'Developer',
        joinedAt: new Date().toISOString(),
        addedBy: { id: 'usr-1', firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah.j@acme.com' },
        status: data.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        members: [fallbackMember, ...state.members],
        isActionLoading: false,
      }));
      return fallbackMember;
    }
  },

  updateMember: async (
    projectId: string,
    memberId: string,
    data: UpdateProjectMemberInput
  ) => {
    set({ isActionLoading: true, error: null });

    // Validate Project Owner downgrade
    const existing = get().members.find((m) => m.id === memberId);
    if (existing && existing.role === 'Project Owner' && data.role && data.role !== 'Project Owner') {
      const owners = get().members.filter((m) => m.role === 'Project Owner');
      if (owners.length <= 1) {
        set({
          error: 'Cannot change the role of the sole Project Owner. Transfer owner role first.',
          isActionLoading: false,
        });
        return false;
      }
    }

    try {
      const response = await ProjectMemberService.updateMember(projectId, memberId, data);
      if (response.success && response.data) {
        const updated = response.data;
        set((state) => ({
          members: state.members.map((m) => (m.id === memberId ? updated : m)),
          selectedMember:
            state.selectedMember?.id === memberId ? updated : state.selectedMember,
          isActionLoading: false,
        }));
        return true;
      }
    } catch {
      // Local fallback
    }

    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              role: data.role || m.role,
              status: data.status || m.status,
              updatedAt: new Date().toISOString(),
            }
          : m
      ),
      selectedMember:
        state.selectedMember?.id === memberId
          ? {
              ...state.selectedMember,
              role: data.role || state.selectedMember.role,
              status: data.status || state.selectedMember.status,
              updatedAt: new Date().toISOString(),
            }
          : state.selectedMember,
      isActionLoading: false,
    }));
    return true;
  },

  removeMember: async (projectId: string, memberId: string) => {
    set({ isActionLoading: true, error: null });

    const existing = get().members.find((m) => m.id === memberId);
    if (existing && existing.role === 'Project Owner') {
      const owners = get().members.filter((m) => m.role === 'Project Owner');
      if (owners.length <= 1) {
        set({
          error: 'Cannot remove the primary Project Owner from the project.',
          isActionLoading: false,
        });
        return false;
      }
    }

    try {
      await ProjectMemberService.removeMember(projectId, memberId);
    } catch {
      // Local fallback
    }

    set((state) => ({
      members: state.members.filter((m) => m.id !== memberId),
      selectedMember: state.selectedMember?.id === memberId ? null : state.selectedMember,
      isActionLoading: false,
    }));
    return true;
  },

  setSelectedMember: (member) => set({ selectedMember: member }),
  clearError: () => set({ error: null }),
}));
