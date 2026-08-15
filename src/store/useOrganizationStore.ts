import { create } from 'zustand';
import {
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationQueryParams,
} from '../types/organization';
import { OrganizationService } from '../services/api/organizationService';

interface OrganizationState {
  organizations: Organization[];
  activeOrganization: Organization | null;
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: string;
  isArchivedFilter: string;

  // Actions
  fetchOrganizations: (params?: OrganizationQueryParams) => Promise<void>;
  fetchOrganizationById: (idOrSlug: string) => Promise<Organization | null>;
  setActiveOrganization: (org: Organization | null) => void;
  createOrganization: (data: CreateOrganizationInput) => Promise<Organization | null>;
  updateOrganization: (id: string, data: UpdateOrganizationInput) => Promise<boolean>;
  archiveOrganization: (id: string) => Promise<boolean>;
  restoreOrganization: (id: string) => Promise<boolean>;
  deleteOrganization: (id: string) => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setIsArchivedFilter: (filter: string) => void;
  clearError: () => void;
}

const ACTIVE_ORG_KEY = 'taskflow_active_organization_id';

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organizations: [],
  activeOrganization: null,
  totalItems: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  isLoading: false,
  isActionLoading: false,
  error: null,
  searchQuery: '',
  statusFilter: 'all',
  isArchivedFilter: 'false',

  fetchOrganizations: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { searchQuery, statusFilter, isArchivedFilter, page, limit } = get();
      const queryParams: OrganizationQueryParams = {
        search: params.search !== undefined ? params.search : searchQuery,
        status: params.status !== undefined ? params.status : statusFilter,
        isArchived: params.isArchived !== undefined ? params.isArchived : isArchivedFilter,
        page: params.page || page,
        limit: params.limit || limit,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc',
      };

      const response = await OrganizationService.getOrganizations(queryParams);
      const fetchedOrgs = response.data || [];
      const meta = response.meta;

      let active = get().activeOrganization;
      const savedActiveId = localStorage.getItem(ACTIVE_ORG_KEY);

      if (fetchedOrgs.length > 0) {
        if (savedActiveId) {
          const matched = fetchedOrgs.find((o) => o.id === savedActiveId || o.slug === savedActiveId);
          if (matched) {
            active = matched;
          } else if (!active) {
            active = fetchedOrgs[0];
          }
        } else if (!active) {
          active = fetchedOrgs[0];
        }
      } else {
        active = null;
      }

      if (active) {
        localStorage.setItem(ACTIVE_ORG_KEY, active.id);
      } else {
        localStorage.removeItem(ACTIVE_ORG_KEY);
      }

      set({
        organizations: fetchedOrgs,
        activeOrganization: active,
        totalItems: meta?.totalItems || fetchedOrgs.length,
        page: meta?.page || 1,
        limit: meta?.limit || 20,
        totalPages: meta?.totalPages || 1,
        isLoading: false,
      });
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to fetch organizations.';
      set({ error: errorMsg, isLoading: false });
    }
  },

  fetchOrganizationById: async (idOrSlug: string) => {
    try {
      const response = await OrganizationService.getOrganizationById(idOrSlug);
      if (response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  setActiveOrganization: (org) => {
    if (org) {
      localStorage.setItem(ACTIVE_ORG_KEY, org.id);
    } else {
      localStorage.removeItem(ACTIVE_ORG_KEY);
    }
    set({ activeOrganization: org });
  },

  createOrganization: async (data) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await OrganizationService.createOrganization(data);
      const newOrg = response.data;
      if (newOrg) {
        set((state) => ({
          organizations: [newOrg, ...state.organizations],
          activeOrganization: newOrg,
          totalItems: state.totalItems + 1,
          isActionLoading: false,
        }));
        localStorage.setItem(ACTIVE_ORG_KEY, newOrg.id);
        return newOrg;
      }
      throw new Error(response.message || 'Failed to create organization');
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to create organization.';
      set({ error: errorMsg, isActionLoading: false });
      return null;
    }
  },

  updateOrganization: async (id, data) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await OrganizationService.updateOrganization(id, data);
      const updatedOrg = response.data;
      if (updatedOrg) {
        set((state) => ({
          organizations: state.organizations.map((o) => (o.id === id ? updatedOrg : o)),
          activeOrganization:
            state.activeOrganization?.id === id ? updatedOrg : state.activeOrganization,
          isActionLoading: false,
        }));
        return true;
      }
      throw new Error(response.message || 'Failed to update organization');
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to update organization.';
      set({ error: errorMsg, isActionLoading: false });
      return false;
    }
  },

  archiveOrganization: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await OrganizationService.archiveOrganization(id);
      const archivedOrg = response.data;
      if (archivedOrg) {
        set((state) => {
          const updatedOrgs = state.organizations.map((o) => (o.id === id ? archivedOrg : o));
          let nextActive = state.activeOrganization;
          if (state.activeOrganization?.id === id) {
            nextActive = updatedOrgs.find((o) => !o.isArchived) || updatedOrgs[0] || null;
          }
          if (nextActive) {
            localStorage.setItem(ACTIVE_ORG_KEY, nextActive.id);
          } else {
            localStorage.removeItem(ACTIVE_ORG_KEY);
          }
          return {
            organizations: updatedOrgs,
            activeOrganization: nextActive,
            isActionLoading: false,
          };
        });
        return true;
      }
      throw new Error(response.message || 'Failed to archive organization');
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to archive organization.';
      set({ error: errorMsg, isActionLoading: false });
      return false;
    }
  },

  restoreOrganization: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await OrganizationService.restoreOrganization(id);
      const restoredOrg = response.data;
      if (restoredOrg) {
        set((state) => ({
          organizations: state.organizations.map((o) => (o.id === id ? restoredOrg : o)),
          isActionLoading: false,
        }));
        return true;
      }
      throw new Error(response.message || 'Failed to restore organization');
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to restore organization.';
      set({ error: errorMsg, isActionLoading: false });
      return false;
    }
  },

  deleteOrganization: async (id) => {
    set({ isActionLoading: true, error: null });
    try {
      await OrganizationService.deleteOrganization(id);
      set((state) => {
        const remainingOrgs = state.organizations.filter((o) => o.id !== id);
        let nextActive = state.activeOrganization;
        if (state.activeOrganization?.id === id) {
          nextActive = remainingOrgs[0] || null;
        }
        if (nextActive) {
          localStorage.setItem(ACTIVE_ORG_KEY, nextActive.id);
        } else {
          localStorage.removeItem(ACTIVE_ORG_KEY);
        }
        return {
          organizations: remainingOrgs,
          activeOrganization: nextActive,
          totalItems: Math.max(0, state.totalItems - 1),
          isActionLoading: false,
        };
      });
      return true;
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to delete organization.';
      set({ error: errorMsg, isActionLoading: false });
      return false;
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status });
  },

  setIsArchivedFilter: (filter) => {
    set({ isArchivedFilter: filter });
  },

  clearError: () => {
    set({ error: null });
  },
}));
