import { create } from 'zustand';
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryParams,
} from '../types/project';
import { ProjectService } from '../services/api/projectService';

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: (params?: ProjectQueryParams) => Promise<void>;
  getProjectById: (id: string) => Promise<Project | null>;
  createProject: (data: CreateProjectInput) => Promise<Project | null>;
  updateProject: (id: string, data: UpdateProjectInput) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  archiveProject: (id: string) => Promise<boolean>;
  restoreProject: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  togglePin: (id: string) => Promise<boolean>;
  duplicateProject: (id: string, name?: string) => Promise<Project | null>;
  setActiveProject: (project: Project | null) => void;
  clearError: () => void;
}

const ACTIVE_PROJECT_KEY = 'taskflow_active_project_id';

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'Core Platform Microservices',
    projectKey: 'CORE',
    description: 'Scalable auth, notification, and event streaming microservices built on Kubernetes and Node.js.',
    icon: 'server',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    workspace: { id: 'ws-eng-001', name: 'Engineering & Core Platform', slug: 'engineering' },
    organization: { id: 'org-default', name: 'Acme Corp', slug: 'acme-corp' },
    owner: { id: 'user-001', name: 'Sarah Jenkins', email: 'sarah.j@acme.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    visibility: 'workspace',
    status: 'active',
    repositoryUrl: 'https://github.com/acme-corp/core-platform',
    websiteUrl: 'https://core-docs.acme.com',
    startDate: '2026-01-15',
    endDate: '2026-11-30',
    isArchived: false,
    isFavorite: true,
    isPinned: true,
    favoritesCount: 8,
    pinnedCount: 5,
    progress: 68,
    taskCount: { total: 42, completed: 28, inProgress: 10 },
    memberCount: 8,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-002',
    name: 'TaskFlow Next-Gen Web Client',
    projectKey: 'TWA',
    description: 'React 19, TypeScript, and TailwindCSS enterprise web application dashboard and workspace management.',
    icon: 'layout',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    workspace: { id: 'ws-eng-001', name: 'Engineering & Core Platform', slug: 'engineering' },
    organization: { id: 'org-default', name: 'Acme Corp', slug: 'acme-corp' },
    owner: { id: 'user-002', name: 'David Chen', email: 'david.c@acme.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    visibility: 'organization',
    status: 'active',
    repositoryUrl: 'https://github.com/acme-corp/taskflow-web',
    websiteUrl: 'https://app.taskflow.ai',
    startDate: '2026-02-01',
    endDate: '2026-09-15',
    isArchived: false,
    isFavorite: true,
    isPinned: false,
    favoritesCount: 14,
    pinnedCount: 6,
    progress: 82,
    taskCount: { total: 65, completed: 53, inProgress: 8 },
    memberCount: 12,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-003',
    name: 'Unified Design System & UI Kit',
    projectKey: 'DSK',
    description: 'Figma component library, accessible Radix/shadcn primitives, dark/light theme tokens, and design guidelines.',
    icon: 'palette',
    coverImage: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80',
    workspace: { id: 'ws-prod-002', name: 'Product & UX Design', slug: 'product-design' },
    organization: { id: 'org-default', name: 'Acme Corp', slug: 'acme-corp' },
    owner: { id: 'user-003', name: 'Elena Rostova', email: 'elena.r@acme.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    visibility: 'organization',
    status: 'active',
    repositoryUrl: 'https://github.com/acme-corp/design-system',
    websiteUrl: 'https://storybook.acme.com',
    startDate: '2026-03-01',
    endDate: '2026-12-31',
    isArchived: false,
    isFavorite: false,
    isPinned: true,
    favoritesCount: 9,
    pinnedCount: 4,
    progress: 45,
    taskCount: { total: 30, completed: 13, inProgress: 11 },
    memberCount: 6,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-004',
    name: 'Global Product Launch & Growth',
    projectKey: 'MKT',
    description: 'Omnichannel Q3 launch campaign, landing pages, email workflows, and analytics integration.',
    icon: 'target',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    workspace: { id: 'ws-mkt-003', name: 'Growth & Marketing Campaigns', slug: 'growth-marketing' },
    organization: { id: 'org-default', name: 'Acme Corp', slug: 'acme-corp' },
    owner: { id: 'user-004', name: 'Marcus Vance', email: 'marcus.v@acme.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    visibility: 'workspace',
    status: 'planning',
    repositoryUrl: '',
    websiteUrl: 'https://launch.acme.com',
    startDate: '2026-07-01',
    endDate: '2026-10-15',
    isArchived: false,
    isFavorite: false,
    isPinned: false,
    favoritesCount: 3,
    pinnedCount: 1,
    progress: 15,
    taskCount: { total: 24, completed: 3, inProgress: 5 },
    memberCount: 5,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-005',
    name: 'SOC2 Type II & Penetration Testing',
    projectKey: 'SEC',
    description: 'Security controls verification, vendor assessment, RBAC audit, and compliance documentation.',
    icon: 'shield',
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    workspace: { id: 'ws-ops-004', name: 'Operations & Security', slug: 'operations-security' },
    organization: { id: 'org-default', name: 'Acme Corp', slug: 'acme-corp' },
    owner: { id: 'user-005', name: 'Alex Rivera', email: 'alex.r@acme.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    visibility: 'private',
    status: 'on_hold',
    repositoryUrl: '',
    websiteUrl: '',
    startDate: '2026-04-10',
    endDate: '2026-08-30',
    isArchived: false,
    isFavorite: false,
    isPinned: false,
    favoritesCount: 2,
    pinnedCount: 0,
    progress: 35,
    taskCount: { total: 18, completed: 6, inProgress: 2 },
    memberCount: 4,
    createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  isLoading: false,
  isActionLoading: false,
  error: null,

  fetchProjects: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      let fetchedProjects: Project[] = [];
      try {
        const response = await ProjectService.getProjects(params);
        fetchedProjects = response.data || [];
      } catch (apiErr) {
        console.warn('Project API unavailable, falling back to default projects:', apiErr);
      }

      if (fetchedProjects.length === 0 && get().projects.length === 0) {
        fetchedProjects = DEFAULT_PROJECTS;
      } else if (fetchedProjects.length === 0 && get().projects.length > 0) {
        fetchedProjects = get().projects;
      }

      let active = get().activeProject;
      const savedActiveId = localStorage.getItem(ACTIVE_PROJECT_KEY);

      if (!active) {
        if (savedActiveId) {
          active = fetchedProjects.find((p) => p.id === savedActiveId) || null;
        }
        if (!active && fetchedProjects.length > 0) {
          active = fetchedProjects[0];
        }
      } else {
        const updatedActive = fetchedProjects.find((p) => p.id === active?.id);
        if (updatedActive) active = updatedActive;
      }

      set({
        projects: fetchedProjects,
        activeProject: active,
        isLoading: false,
      });

      if (active) {
        localStorage.setItem(ACTIVE_PROJECT_KEY, active.id);
      }
    } catch (err: any) {
      set({
        error: err.message || 'Failed to fetch projects.',
        isLoading: false,
        projects: get().projects.length > 0 ? get().projects : DEFAULT_PROJECTS,
      });
    }
  },

  getProjectById: async (id: string) => {
    const existing = get().projects.find((p) => p.id === id);
    if (existing) return existing;

    try {
      const response = await ProjectService.getProjectById(id);
      if (response.data) return response.data;
    } catch {
      // Fallback
    }
    return null;
  },

  createProject: async (data: CreateProjectInput) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await ProjectService.createProject(data);
      if (response.success && response.data) {
        const newProj = response.data;
        set((state) => ({
          projects: [newProj, ...state.projects],
          activeProject: newProj,
          isActionLoading: false,
        }));
        localStorage.setItem(ACTIVE_PROJECT_KEY, newProj.id);
        return newProj;
      }
      throw new Error(response.message || 'Failed to create project');
    } catch (err: any) {
      // Fallback local creation
      const normalizedKey = data.projectKey.trim().toUpperCase();
      const fallbackProj: Project = {
        id: `proj-${Date.now()}`,
        name: data.name,
        projectKey: normalizedKey,
        description: data.description || '',
        icon: data.icon || 'briefcase',
        coverImage: data.coverImage || '',
        workspace: { id: data.workspaceId, name: 'Active Workspace', slug: 'active-workspace' },
        organization: { id: 'org-default', name: 'Acme Corp', slug: 'acme-corp' },
        owner: { id: 'user-001', name: 'Current User', email: 'user@acme.com' },
        visibility: data.visibility || 'workspace',
        status: data.status || 'active',
        repositoryUrl: data.repositoryUrl || '',
        websiteUrl: data.websiteUrl || '',
        startDate: data.startDate,
        endDate: data.endDate,
        isArchived: false,
        isFavorite: false,
        isPinned: false,
        favoritesCount: 0,
        pinnedCount: 0,
        progress: 0,
        taskCount: { total: 0, completed: 0, inProgress: 0 },
        memberCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        projects: [fallbackProj, ...state.projects],
        activeProject: fallbackProj,
        isActionLoading: false,
      }));
      localStorage.setItem(ACTIVE_PROJECT_KEY, fallbackProj.id);
      return fallbackProj;
    }
  },

  updateProject: async (id: string, data: UpdateProjectInput) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await ProjectService.updateProject(id, data);
      if (response.success && response.data) {
        const updated = response.data;
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? updated : p)),
          activeProject: state.activeProject?.id === id ? updated : state.activeProject,
          isActionLoading: false,
        }));
        return true;
      }
      throw new Error(response.message || 'Failed to update project');
    } catch {
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id
            ? {
                ...p,
                ...data,
                projectKey: data.projectKey ? data.projectKey.toUpperCase() : p.projectKey,
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
        activeProject:
          state.activeProject?.id === id
            ? {
                ...state.activeProject,
                ...data,
                projectKey: data.projectKey ? data.projectKey.toUpperCase() : state.activeProject.projectKey,
                updatedAt: new Date().toISOString(),
              }
            : state.activeProject,
        isActionLoading: false,
      }));
      return true;
    }
  },

  deleteProject: async (id: string) => {
    set({ isActionLoading: true, error: null });
    try {
      await ProjectService.deleteProject(id);
    } catch {
      // Local fallback
    }

    set((state) => {
      const remaining = state.projects.filter((p) => p.id !== id);
      let nextActive = state.activeProject;
      if (state.activeProject?.id === id) {
        nextActive = remaining[0] || null;
      }
      if (nextActive) {
        localStorage.setItem(ACTIVE_PROJECT_KEY, nextActive.id);
      } else {
        localStorage.removeItem(ACTIVE_PROJECT_KEY);
      }
      return {
        projects: remaining,
        activeProject: nextActive,
        isActionLoading: false,
      };
    });
    return true;
  },

  archiveProject: async (id: string) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await ProjectService.archiveProject(id);
      if (response.success && response.data) {
        const updated = response.data;
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? updated : p)),
          activeProject: state.activeProject?.id === id ? updated : state.activeProject,
          isActionLoading: false,
        }));
        return true;
      }
    } catch {
      // Fallback
    }

    set((state) => {
      const updated = state.projects.map((p) =>
        p.id === id ? { ...p, isArchived: true, status: 'archived' as const } : p
      );
      let nextActive = state.activeProject;
      if (state.activeProject?.id === id) {
        nextActive = updated.find((p) => !p.isArchived) || updated[0] || null;
      }
      return {
        projects: updated,
        activeProject: nextActive,
        isActionLoading: false,
      };
    });
    return true;
  },

  restoreProject: async (id: string) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await ProjectService.restoreProject(id);
      if (response.success && response.data) {
        const updated = response.data;
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? updated : p)),
          isActionLoading: false,
        }));
        return true;
      }
    } catch {
      // Fallback
    }

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, isArchived: false, status: 'active' as const } : p
      ),
      isActionLoading: false,
    }));
    return true;
  },

  toggleFavorite: async (id: string) => {
    try {
      await ProjectService.toggleFavorite(id);
    } catch {
      // Fallback
    }

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      ),
      activeProject:
        state.activeProject?.id === id
          ? { ...state.activeProject, isFavorite: !state.activeProject.isFavorite }
          : state.activeProject,
    }));
    return true;
  },

  togglePin: async (id: string) => {
    try {
      await ProjectService.togglePin(id);
    } catch {
      // Fallback
    }

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, isPinned: !p.isPinned } : p
      ),
      activeProject:
        state.activeProject?.id === id
          ? { ...state.activeProject, isPinned: !state.activeProject.isPinned }
          : state.activeProject,
    }));
    return true;
  },

  duplicateProject: async (id: string, name?: string) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await ProjectService.duplicateProject(id, name);
      if (response.success && response.data) {
        const dup = response.data;
        set((state) => ({
          projects: [dup, ...state.projects],
          isActionLoading: false,
        }));
        return dup;
      }
    } catch {
      // Fallback
    }

    const original = get().projects.find((p) => p.id === id);
    if (!original) {
      set({ isActionLoading: false });
      return null;
    }

    const dupName = name || `${original.name} (Copy)`;
    const dupKey = `${original.projectKey}_C${Math.floor(Math.random() * 100)}`.slice(0, 15);
    const dupProj: Project = {
      ...original,
      id: `proj-${Date.now()}`,
      name: dupName,
      projectKey: dupKey,
      isFavorite: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      projects: [dupProj, ...state.projects],
      isActionLoading: false,
    }));
    return dupProj;
  },

  setActiveProject: (project: Project | null) => {
    set({ activeProject: project });
    if (project) {
      localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
    } else {
      localStorage.removeItem(ACTIVE_PROJECT_KEY);
    }
  },

  clearError: () => set({ error: null }),
}));
