import { create } from 'zustand';
import {
  Workspace,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  WorkspaceQueryParams,
} from '../types/workspace';
import { WorkspaceService } from '../services/api/workspaceService';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  searchQuery: string;
  visibilityFilter: string;
  isArchivedFilter: boolean;
  viewMode: 'grid' | 'list';

  // Actions
  fetchWorkspaces: (params?: WorkspaceQueryParams) => Promise<void>;
  fetchWorkspaceById: (idOrSlug: string) => Promise<Workspace | null>;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (data: CreateWorkspaceInput) => Promise<Workspace | null>;
  updateWorkspace: (id: string, data: UpdateWorkspaceInput) => Promise<boolean>;
  deleteWorkspace: (id: string) => Promise<boolean>;
  archiveWorkspace: (id: string) => Promise<boolean>;
  restoreWorkspace: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  togglePin: (id: string) => Promise<boolean>;
  duplicateWorkspace: (id: string, name?: string) => Promise<Workspace | null>;
  setSearchQuery: (query: string) => void;
  setVisibilityFilter: (filter: string) => void;
  setIsArchivedFilter: (isArchived: boolean) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  clearError: () => void;
}

const ACTIVE_WORKSPACE_KEY = 'taskflow_active_workspace_id';

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 'ws-eng-001',
    name: 'Engineering & Core Platform',
    slug: 'engineering',
    description: 'Microservices, cloud infrastructure, sprint backlogs, release management, and API design.',
    icon: 'code',
    color: '#6366f1',
    visibility: 'organization',
    organization: { id: 'org-default', name: 'Acme Corp', slug: 'acme-corp' },
    owner: { id: 'user-001', name: 'System Admin', email: 'admin@acme.com' },
    isArchived: false,
    isFavorite: true,
    isPinned: true,
    favoritesCount: 12,
    pinnedCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ws-prod-002',
    name: 'Product & UX Design',
    slug: 'product-design',
    description: 'Product specifications, UI component library, user journeys, and feature roadmap.',
    icon: 'layers',
    color: '#ec4899',
    visibility: 'organization',
    organization: { id: 'org-default', name: 'Acme Corp', slug: 'acme-corp' },
    owner: { id: 'user-001', name: 'System Admin', email: 'admin@acme.com' },
    isArchived: false,
    isFavorite: true,
    isPinned: false,
    favoritesCount: 8,
    pinnedCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ws-mkt-003',
    name: 'Growth & Marketing Campaigns',
    slug: 'growth-marketing',
    description: 'Product launch campaigns, performance analytics, social media calendars, and content creation.',
    icon: 'target',
    color: '#f59e0b',
    visibility: 'public',
    organization: { id: 'org-default', name: 'Acme Corp', slug: 'acme-corp' },
    owner: { id: 'user-001', name: 'System Admin', email: 'admin@acme.com' },
    isArchived: false,
    isFavorite: false,
    isPinned: false,
    favoritesCount: 3,
    pinnedCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ws-ops-004',
    name: 'Operations & Security',
    slug: 'operations-security',
    description: 'SOC2 compliance, internal tools, security audits, and team onboarding protocols.',
    icon: 'shield',
    color: '#10b981',
    visibility: 'private',
    organization: { id: 'org-default', name: 'Acme Corp', slug: 'acme-corp' },
    owner: { id: 'user-001', name: 'System Admin', email: 'admin@acme.com' },
    isArchived: false,
    isFavorite: false,
    isPinned: false,
    favoritesCount: 2,
    pinnedCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
  searchQuery: '',
  visibilityFilter: 'all',
  isArchivedFilter: false,
  viewMode: 'grid',

  fetchWorkspaces: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { searchQuery, visibilityFilter, isArchivedFilter } = get();
      const queryParams: WorkspaceQueryParams = {
        search: params.search !== undefined ? params.search : searchQuery,
        visibility: params.visibility || (visibilityFilter !== 'all' ? (visibilityFilter as any) : undefined),
        isArchived: params.isArchived !== undefined ? params.isArchived : isArchivedFilter,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc',
      };

      let fetchedWorkspaces: Workspace[] = [];
      try {
        const response = await WorkspaceService.getWorkspaces(queryParams);
        fetchedWorkspaces = response.data || [];
      } catch (apiErr) {
        console.warn('Workspace API unavailable, falling back to default workspaces:', apiErr);
      }

      // If backend returns empty array or API fails, use default fallback workspaces
      if (fetchedWorkspaces.length === 0 && get().workspaces.length === 0) {
        fetchedWorkspaces = DEFAULT_WORKSPACES;
      } else if (fetchedWorkspaces.length === 0 && get().workspaces.length > 0) {
        fetchedWorkspaces = get().workspaces;
      }

      let active = get().activeWorkspace;
      const savedActiveId = localStorage.getItem(ACTIVE_WORKSPACE_KEY);

      if (fetchedWorkspaces.length > 0) {
        if (savedActiveId) {
          const matched = fetchedWorkspaces.find((w) => w.id === savedActiveId || w.slug === savedActiveId);
          if (matched) {
            active = matched;
          } else if (!active) {
            active = fetchedWorkspaces[0];
          }
        } else if (!active) {
          active = fetchedWorkspaces[0];
        }
      } else {
        active = null;
      }

      if (active) {
        localStorage.setItem(ACTIVE_WORKSPACE_KEY, active.id);
      } else {
        localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
      }

      set({
        workspaces: fetchedWorkspaces,
        activeWorkspace: active,
        isLoading: false,
      });
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to fetch workspaces.';
      set({ error: errorMsg, isLoading: false });
    }
  },

  fetchWorkspaceById: async (idOrSlug: string) => {
    try {
      const response = await WorkspaceService.getWorkspaceById(idOrSlug);
      return response.data || null;
    } catch {
      return null;
    }
  },

  setActiveWorkspace: (workspace) => {
    if (workspace) {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspace.id);
    } else {
      localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
    }
    set({ activeWorkspace: workspace });
  },

  createWorkspace: async (data) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await WorkspaceService.createWorkspace(data);
      const newWs = response.data;
      if (newWs) {
        set((state) => ({
          workspaces: [newWs, ...state.workspaces],
          activeWorkspace: newWs,
          isActionLoading: false,
        }));
        localStorage.setItem(ACTIVE_WORKSPACE_KEY, newWs.id);
        return newWs;
      }
      throw new Error(response.message || 'Failed to create workspace');
    } catch (err) {
      // Local fallback creation
      const fallbackWs: Workspace = {
        id: `ws-${Date.now()}`,
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: data.description || '',
        icon: data.icon || 'briefcase',
        color: data.color || '#6366f1',
        visibility: data.visibility || 'organization',
        organization: { id: 'org-default', name: 'Acme Corp', slug: 'acme-corp' },
        owner: { id: 'user-001', name: 'System Admin', email: 'admin@acme.com' },
        isArchived: false,
        isFavorite: false,
        isPinned: false,
        favoritesCount: 0,
        pinnedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({
        workspaces: [fallbackWs, ...state.workspaces],
        activeWorkspace: fallbackWs,
        isActionLoading: false,
      }));
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, fallbackWs.id);
      return fallbackWs;
    }
  },

  updateWorkspace: async (id, data) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await WorkspaceService.updateWorkspace(id, data);
      const updated = response.data;
      if (updated) {
        set((state) => ({
          workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
          activeWorkspace: state.activeWorkspace?.id === id ? updated : state.activeWorkspace,
          isActionLoading: false,
        }));
        return true;
      }
      throw new Error(response.message || 'Failed to update workspace');
    } catch (err) {
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === id
            ? { ...w, ...data, updatedAt: new Date().toISOString() }
            : w
        ),
        activeWorkspace:
          state.activeWorkspace?.id === id
            ? { ...state.activeWorkspace, ...data, updatedAt: new Date().toISOString() }
            : state.activeWorkspace,
        isActionLoading: false,
      }));
      return true;
    }
  },

  deleteWorkspace: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      await WorkspaceService.deleteWorkspace(id);
    } catch {
      // Proceed with local deletion even if API fails
    }
    set((state) => {
      const remaining = state.workspaces.filter((w) => w.id !== id);
      let nextActive = state.activeWorkspace;
      if (state.activeWorkspace?.id === id) {
        nextActive = remaining[0] || null;
      }
      if (nextActive) {
        localStorage.setItem(ACTIVE_WORKSPACE_KEY, nextActive.id);
      } else {
        localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
      }
      return {
        workspaces: remaining,
        activeWorkspace: nextActive,
        isActionLoading: false,
      };
    });
    return true;
  },

  archiveWorkspace: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await WorkspaceService.archiveWorkspace(id);
      const archived = response.data;
      if (archived) {
        set((state) => {
          const updated = state.workspaces.map((w) => (w.id === id ? archived : w));
          let nextActive = state.activeWorkspace;
          if (state.activeWorkspace?.id === id) {
            nextActive = updated.find((w) => !w.isArchived) || updated[0] || null;
          }
          if (nextActive) {
            localStorage.setItem(ACTIVE_WORKSPACE_KEY, nextActive.id);
          } else {
            localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
          }
          return {
            workspaces: updated,
            activeWorkspace: nextActive,
            isActionLoading: false,
          };
        });
        return true;
      }
      throw new Error('Failed to archive workspace');
    } catch {
      set((state) => {
        const updated = state.workspaces.map((w) => (w.id === id ? { ...w, isArchived: true } : w));
        let nextActive = state.activeWorkspace;
        if (state.activeWorkspace?.id === id) {
          nextActive = updated.find((w) => !w.isArchived) || updated[0] || null;
        }
        if (nextActive) {
          localStorage.setItem(ACTIVE_WORKSPACE_KEY, nextActive.id);
        } else {
          localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
        }
        return {
          workspaces: updated,
          activeWorkspace: nextActive,
          isActionLoading: false,
        };
      });
      return true;
    }
  },

  restoreWorkspace: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await WorkspaceService.restoreWorkspace(id);
      const restored = response.data;
      if (restored) {
        set((state) => ({
          workspaces: state.workspaces.map((w) => (w.id === id ? restored : w)),
          isActionLoading: false,
        }));
        return true;
      }
      throw new Error('Failed to restore workspace');
    } catch {
      set((state) => ({
        workspaces: state.workspaces.map((w) => (w.id === id ? { ...w, isArchived: false } : w)),
        isActionLoading: false,
      }));
      return true;
    }
  },

  toggleFavorite: async (id) => {
    try {
      const response = await WorkspaceService.toggleFavorite(id);
      const updated = response.data;
      if (updated) {
        set((state) => ({
          workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
          activeWorkspace: state.activeWorkspace?.id === id ? updated : state.activeWorkspace,
        }));
        return true;
      }
    } catch {
      // Fallback local toggle
    }
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
      ),
      activeWorkspace:
        state.activeWorkspace?.id === id
          ? { ...state.activeWorkspace, isFavorite: !state.activeWorkspace.isFavorite }
          : state.activeWorkspace,
    }));
    return true;
  },

  togglePin: async (id) => {
    try {
      const response = await WorkspaceService.togglePin(id);
      const updated = response.data;
      if (updated) {
        set((state) => ({
          workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
          activeWorkspace: state.activeWorkspace?.id === id ? updated : state.activeWorkspace,
        }));
        return true;
      }
    } catch {
      // Fallback local toggle
    }
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? { ...w, isPinned: !w.isPinned } : w
      ),
      activeWorkspace:
        state.activeWorkspace?.id === id
          ? { ...state.activeWorkspace, isPinned: !state.activeWorkspace.isPinned }
          : state.activeWorkspace,
    }));
    return true;
  },

  duplicateWorkspace: async (id, name) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await WorkspaceService.duplicateWorkspace(id, name);
      const duplicated = response.data;
      if (duplicated) {
        set((state) => ({
          workspaces: [duplicated, ...state.workspaces],
          isActionLoading: false,
        }));
        return duplicated;
      }
      throw new Error('Failed to duplicate workspace');
    } catch {
      const original = get().workspaces.find((w) => w.id === id);
      if (!original) {
        set({ isActionLoading: false });
        return null;
      }
      const duplicatedName = name || `${original.name} (Copy)`;
      const dupWs: Workspace = {
        ...original,
        id: `ws-${Date.now()}`,
        name: duplicatedName,
        slug: `${original.slug}-copy-${Math.floor(Math.random() * 1000)}`,
        isFavorite: false,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({
        workspaces: [dupWs, ...state.workspaces],
        isActionLoading: false,
      }));
      return dupWs;
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setVisibilityFilter: (filter) => {
    set({ visibilityFilter: filter });
  },

  setIsArchivedFilter: (isArchived) => {
    set({ isArchivedFilter: isArchived });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  clearError: () => {
    set({ error: null });
  },
}));
