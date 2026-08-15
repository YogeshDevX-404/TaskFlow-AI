import { create } from 'zustand';
import {
  WorkAssignment,
  CreateAssignmentInput,
  UpdateAssignmentInput,
  AssignmentStatus,
  AssignmentPriority,
  DeveloperWorkloadStats,
  IReferenceImage,
  IInstructionStep,
  IExpectedResult,
  IAcceptanceCriterion,
  IProofOfWork,
} from '../types/workAssignment';
import { AcceptanceCriterionStatus } from '../config/assignmentConfig';
import { WorkAssignmentService } from '../services/api/workAssignmentService';
import { useOrganizationStore } from './useOrganizationStore';
import { useWorkspaceStore } from './useWorkspaceStore';

export type WorkAssignmentViewMode = 'list' | 'kanban' | 'workload-matrix' | 'monitoring';
export type WorkAssignmentScope = 'all' | 'my';

interface WorkAssignmentState {
  assignments: WorkAssignment[];
  myAssignments: WorkAssignment[];
  selectedAssignment: WorkAssignment | null;
  developerWorkload: Record<string, DeveloperWorkloadStats>;
  scope: WorkAssignmentScope;
  viewMode: WorkAssignmentViewMode;
  searchQuery: string;
  filters: {
    status: string;
    priority: string;
    projectId: string;
    assignedToId: string;
    isOverdue: boolean;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  actionLoading: boolean;
  error: string | null;

  // Bulk Selection
  selectedAssignmentIds: string[];
  toggleSelectAssignment: (id: string) => void;
  selectAllAssignments: (ids: string[]) => void;
  clearSelection: () => void;
  bulkReassign: (newDeveloperId: string, reason?: string) => Promise<boolean>;
  bulkUpdatePriority: (priority: AssignmentPriority) => Promise<boolean>;
  bulkUpdateStatus: (status: AssignmentStatus, reason?: string) => Promise<boolean>;
  bulkArchive: () => Promise<boolean>;

  // Saved Filter Preset
  savedFilterPreset: string;
  applyFilterPreset: (preset: string) => void;

  // View & Scope Setters
  setScope: (scope: WorkAssignmentScope) => void;
  setViewMode: (mode: WorkAssignmentViewMode) => void;
  setSelectedAssignment: (assignment: WorkAssignment | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setPriorityFilter: (priority: string) => void;
  setProjectFilter: (projectId: string) => void;
  setAssignedToFilter: (assignedToId: string) => void;
  setIsOverdueFilter: (isOverdue: boolean) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;

  // Async API Operations
  fetchAssignments: () => Promise<void>;
  fetchMyAssignments: () => Promise<void>;
  fetchAssignmentById: (idOrKey: string) => Promise<WorkAssignment | null>;
  fetchDeveloperWorkload: (developerId: string) => Promise<DeveloperWorkloadStats | null>;
  createAssignment: (data: CreateAssignmentInput) => Promise<WorkAssignment | null>;
  updateAssignment: (id: string, data: UpdateAssignmentInput) => Promise<WorkAssignment | null>;
  updateStatus: (id: string, status: AssignmentStatus, reason?: string) => Promise<WorkAssignment | null>;
  updateProgress: (
    id: string,
    percentage: number,
    comment?: string,
    attachmentUrl?: string,
    attachmentName?: string,
    evidenceAttachments?: IProofOfWork[]
  ) => Promise<WorkAssignment | null>;
  reassign: (id: string, newDeveloperId: string, reason?: string) => Promise<WorkAssignment | null>;
  submitWork: (
    id: string,
    data: {
      completionNote: string;
      githubPrUrl?: string;
      githubCommitSha?: string;
      githubBranch?: string;
      proofAttachments?: any[];
    }
  ) => Promise<WorkAssignment | null>;
  reviewSubmission: (
    id: string,
    data: {
      decision: 'approve' | 'request_changes' | 'reject';
      reason?: string;
      completionNote?: string;
      feedbackAttachments?: any[];
      submissionId?: string;
    }
  ) => Promise<WorkAssignment | null>;
  deleteAssignment: (id: string) => Promise<boolean>;

  // Reference Images
  addReferenceImages: (id: string, images: Array<Partial<IReferenceImage>>) => Promise<WorkAssignment | null>;
  updateReferenceImage: (
    id: string,
    imageId: string,
    updates: { caption?: string; description?: string; order?: number }
  ) => Promise<WorkAssignment | null>;
  reorderReferenceImages: (id: string, orderedImageIds: string[]) => Promise<WorkAssignment | null>;
  removeReferenceImage: (id: string, imageId: string) => Promise<WorkAssignment | null>;

  // Instruction Steps & Expected Results
  updateInstructionSteps: (id: string, steps: IInstructionStep[]) => Promise<WorkAssignment | null>;
  updateExpectedResult: (id: string, expectedResult: IExpectedResult) => Promise<WorkAssignment | null>;

  // Acceptance Criteria
  addAcceptanceCriterion: (
    id: string,
    criterion: { title: string; description?: string; isRequired?: boolean }
  ) => Promise<WorkAssignment | null>;
  updateAcceptanceCriterionStatus: (
    id: string,
    criterionId: string,
    status: AcceptanceCriterionStatus,
    notes?: string
  ) => Promise<WorkAssignment | null>;
  removeAcceptanceCriterion: (id: string, criterionId: string) => Promise<WorkAssignment | null>;

  // Proof of Work
  addProofOfWork: (id: string, proofData: Partial<IProofOfWork>) => Promise<WorkAssignment | null>;
  removeProofOfWork: (id: string, proofId: string) => Promise<WorkAssignment | null>;

  // Realtime Local Sync
  addLocalAssignment: (assignment: WorkAssignment) => void;
  updateLocalAssignment: (id: string, updates: Partial<WorkAssignment>) => void;
  removeLocalAssignment: (id: string) => void;
}

export const useWorkAssignmentStore = create<WorkAssignmentState>((set, get) => ({
  assignments: [],
  myAssignments: [],
  selectedAssignment: null,
  selectedAssignmentIds: [],
  savedFilterPreset: 'all',
  developerWorkload: {},
  scope: 'all',
  viewMode: 'kanban',
  searchQuery: '',
  filters: {
    status: 'all',
    priority: 'all',
    projectId: 'all',
    assignedToId: 'all',
    isOverdue: false,
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  },
  loading: false,
  actionLoading: false,
  error: null,

  // Bulk Selection
  toggleSelectAssignment: (id) => {
    set((state) => {
      const exists = state.selectedAssignmentIds.includes(id);
      return {
        selectedAssignmentIds: exists
          ? state.selectedAssignmentIds.filter((item) => item !== id)
          : [...state.selectedAssignmentIds, id],
      };
    });
  },

  selectAllAssignments: (ids) => {
    set({ selectedAssignmentIds: ids });
  },

  clearSelection: () => {
    set({ selectedAssignmentIds: [] });
  },

  applyFilterPreset: (preset) => {
    set({ savedFilterPreset: preset });
    switch (preset) {
      case 'all_active':
        set((state) => ({
          filters: { ...state.filters, status: 'all', isOverdue: false, priority: 'all' },
        }));
        break;
      case 'overdue':
        set((state) => ({
          filters: { ...state.filters, status: 'all', isOverdue: true, priority: 'all' },
        }));
        break;
      case 'awaiting_review':
        set((state) => ({
          filters: { ...state.filters, status: 'Submitted', isOverdue: false, priority: 'all' },
        }));
        break;
      case 'high_priority':
        set((state) => ({
          filters: { ...state.filters, status: 'all', isOverdue: false, priority: 'High' },
        }));
        break;
      case 'blocked':
        set((state) => ({
          filters: { ...state.filters, status: 'Blocked', isOverdue: false, priority: 'all' },
        }));
        break;
      case 'in_progress':
        set((state) => ({
          filters: { ...state.filters, status: 'In Progress', isOverdue: false, priority: 'all' },
        }));
        break;
      default:
        get().resetFilters();
        break;
    }
    get().fetchAssignments();
  },

  bulkReassign: async (newDeveloperId, reason) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    const { selectedAssignmentIds } = get();
    if (!selectedAssignmentIds.length) return false;

    set({ actionLoading: true, error: null });
    try {
      await WorkAssignmentService.bulkReassign(
        { assignmentIds: selectedAssignmentIds, newDeveloperId, reason },
        orgId ? orgId.toString() : undefined
      );
      set({ selectedAssignmentIds: [], actionLoading: false });
      await get().fetchAssignments();
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to bulk reassign',
        actionLoading: false,
      });
      return false;
    }
  },

  bulkUpdatePriority: async (priority) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    const { selectedAssignmentIds } = get();
    if (!selectedAssignmentIds.length) return false;

    set({ actionLoading: true, error: null });
    try {
      await WorkAssignmentService.bulkUpdatePriority(
        { assignmentIds: selectedAssignmentIds, priority },
        orgId ? orgId.toString() : undefined
      );
      set({ selectedAssignmentIds: [], actionLoading: false });
      await get().fetchAssignments();
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to bulk update priority',
        actionLoading: false,
      });
      return false;
    }
  },

  bulkUpdateStatus: async (status, reason) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    const { selectedAssignmentIds } = get();
    if (!selectedAssignmentIds.length) return false;

    set({ actionLoading: true, error: null });
    try {
      await WorkAssignmentService.bulkUpdateStatus(
        { assignmentIds: selectedAssignmentIds, status, reason },
        orgId ? orgId.toString() : undefined
      );
      set({ selectedAssignmentIds: [], actionLoading: false });
      await get().fetchAssignments();
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to bulk update status',
        actionLoading: false,
      });
      return false;
    }
  },

  bulkArchive: async () => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    const { selectedAssignmentIds } = get();
    if (!selectedAssignmentIds.length) return false;

    set({ actionLoading: true, error: null });
    try {
      await WorkAssignmentService.bulkArchive(
        { assignmentIds: selectedAssignmentIds },
        orgId ? orgId.toString() : undefined
      );
      set({ selectedAssignmentIds: [], actionLoading: false });
      await get().fetchAssignments();
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to bulk archive',
        actionLoading: false,
      });
      return false;
    }
  },

  setScope: (scope) => {
    set({ scope });
    if (scope === 'my') {
      get().fetchMyAssignments();
    } else {
      get().fetchAssignments();
    }
  },

  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedAssignment: (selectedAssignment) => set({ selectedAssignment }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setStatusFilter: (status) =>
    set((state) => ({ filters: { ...state.filters, status }, pagination: { ...state.pagination, page: 1 } })),
  setPriorityFilter: (priority) =>
    set((state) => ({ filters: { ...state.filters, priority }, pagination: { ...state.pagination, page: 1 } })),
  setProjectFilter: (projectId) =>
    set((state) => ({ filters: { ...state.filters, projectId }, pagination: { ...state.pagination, page: 1 } })),
  setAssignedToFilter: (assignedToId) =>
    set((state) => ({ filters: { ...state.filters, assignedToId }, pagination: { ...state.pagination, page: 1 } })),
  setIsOverdueFilter: (isOverdue) =>
    set((state) => ({ filters: { ...state.filters, isOverdue }, pagination: { ...state.pagination, page: 1 } })),
  setPage: (page) => set((state) => ({ pagination: { ...state.pagination, page } })),

  resetFilters: () =>
    set({
      searchQuery: '',
      filters: {
        status: 'all',
        priority: 'all',
        projectId: 'all',
        assignedToId: 'all',
        isOverdue: false,
      },
    }),

  fetchAssignments: async () => {
    const { activeOrganization } = useOrganizationStore.getState();
    const { activeWorkspace } = useWorkspaceStore.getState();
    const { filters, searchQuery, pagination } = get();

    if (!activeOrganization?.id) return;
    const orgId = activeOrganization.id.toString();

    set({ loading: true, error: null });
    try {
      const params: any = {
        organizationId: orgId,
        page: pagination.page,
        limit: pagination.limit,
      };

      if (activeWorkspace?.id) {
        params.workspaceId = activeWorkspace.id.toString();
      }

      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.projectId !== 'all') params.projectId = filters.projectId;
      if (filters.assignedToId !== 'all') params.assignedToId = filters.assignedToId;
      if (filters.isOverdue) params.isOverdue = true;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await WorkAssignmentService.getAssignments(params);

      set({
        assignments: response.items,
        pagination: response.pagination,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to fetch assignments',
        loading: false,
      });
    }
  },

  fetchMyAssignments: async () => {
    const { activeOrganization } = useOrganizationStore.getState();
    const { filters, searchQuery, pagination } = get();

    if (!activeOrganization?.id) return;
    const orgId = activeOrganization.id.toString();

    set({ loading: true, error: null });
    try {
      const params: any = {
        organizationId: orgId,
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.projectId !== 'all') params.projectId = filters.projectId;
      if (filters.isOverdue) params.isOverdue = true;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await WorkAssignmentService.getMyAssignments(params);

      set({
        myAssignments: response.items,
        pagination: response.pagination,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to fetch my assignments',
        loading: false,
      });
    }
  },

  fetchAssignmentById: async (idOrKey: string) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;

    try {
      const item = await WorkAssignmentService.getAssignmentById(idOrKey, orgId ? orgId.toString() : undefined);
      if (item) {
        set((state) => ({
          selectedAssignment: item,
          assignments: state.assignments.map((a) => (a.id === item.id || a.assignmentId === item.assignmentId ? item : a)),
        }));
      }
      return item;
    } catch (err) {
      return null;
    }
  },

  fetchDeveloperWorkload: async (developerId: string) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    if (!orgId) return null;

    try {
      const workload = await WorkAssignmentService.getDeveloperWorkload(developerId, orgId.toString());
      set((state) => ({
        developerWorkload: {
          ...state.developerWorkload,
          [developerId]: workload,
        },
      }));
      return workload;
    } catch (err) {
      return null;
    }
  },

  createAssignment: async (data: CreateAssignmentInput) => {
    set({ actionLoading: true, error: null });
    try {
      const newAssignment = await WorkAssignmentService.createAssignment(data);
      set((state) => ({
        assignments: [newAssignment, ...state.assignments],
        actionLoading: false,
      }));
      return newAssignment;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to create work assignment',
        actionLoading: false,
      });
      return null;
    }
  },

  updateAssignment: async (id: string, data: UpdateAssignmentInput) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;

    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.updateAssignment(id, {
        ...data,
        organizationId: orgId ? orgId.toString() : undefined,
      });

      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to update assignment',
        actionLoading: false,
      });
      return null;
    }
  },

  updateStatus: async (id: string, status: AssignmentStatus, reason?: string) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;

    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.updateStatus(id, status, reason, orgId ? orgId.toString() : undefined);

      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to update status',
        actionLoading: false,
      });
      return null;
    }
  },

  updateProgress: async (id, percentage, comment, attachmentUrl, attachmentName, evidenceAttachments) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;

    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.updateProgress(
        id,
        percentage,
        comment,
        attachmentUrl,
        attachmentName,
        evidenceAttachments,
        orgId ? orgId.toString() : undefined
      );

      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to update progress',
        actionLoading: false,
      });
      return null;
    }
  },

  reassign: async (id: string, newDeveloperId: string, reason?: string) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;

    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.reassign(id, newDeveloperId, reason, orgId ? orgId.toString() : undefined);

      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to reassign work',
        actionLoading: false,
      });
      return null;
    }
  },

  submitWork: async (id: string, data) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;

    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.submitWork(id, {
        ...data,
        organizationId: orgId ? orgId.toString() : undefined,
      });

      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to submit work',
        actionLoading: false,
      });
      return null;
    }
  },

  reviewSubmission: async (id: string, data) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;

    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.reviewSubmission(id, {
        ...data,
        organizationId: orgId ? orgId.toString() : undefined,
      });

      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to review submission',
        actionLoading: false,
      });
      return null;
    }
  },

  deleteAssignment: async (id: string) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;

    set({ actionLoading: true, error: null });
    try {
      await WorkAssignmentService.deleteAssignment(id, orgId ? orgId.toString() : undefined);
      set((state) => ({
        assignments: state.assignments.filter((a) => a.id !== id),
        myAssignments: state.myAssignments.filter((a) => a.id !== id),
        selectedAssignment: state.selectedAssignment?.id === id ? null : state.selectedAssignment,
        actionLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to delete assignment',
        actionLoading: false,
      });
      return false;
    }
  },

  addReferenceImages: async (id, images) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.addReferenceImages(id, images, orgId ? orgId.toString() : undefined);
      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to add reference images',
        actionLoading: false,
      });
      return null;
    }
  },

  updateReferenceImage: async (id, imageId, updates) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.updateReferenceImage(id, imageId, updates, orgId ? orgId.toString() : undefined);
      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to update reference image',
        actionLoading: false,
      });
      return null;
    }
  },

  reorderReferenceImages: async (id, orderedImageIds) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.reorderReferenceImages(id, orderedImageIds, orgId ? orgId.toString() : undefined);
      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to reorder reference images',
        actionLoading: false,
      });
      return null;
    }
  },

  removeReferenceImage: async (id, imageId) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.removeReferenceImage(id, imageId, orgId ? orgId.toString() : undefined);
      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to remove reference image',
        actionLoading: false,
      });
      return null;
    }
  },

  updateInstructionSteps: async (id, steps) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.updateInstructionSteps(id, steps, orgId ? orgId.toString() : undefined);
      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to update instruction steps',
        actionLoading: false,
      });
      return null;
    }
  },

  updateExpectedResult: async (id, expectedResult) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.updateExpectedResult(id, expectedResult, orgId ? orgId.toString() : undefined);
      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to update expected result',
        actionLoading: false,
      });
      return null;
    }
  },

  addAcceptanceCriterion: async (id, criterion) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.addAcceptanceCriterion(id, criterion, orgId ? orgId.toString() : undefined);
      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to add acceptance criterion',
        actionLoading: false,
      });
      return null;
    }
  },

  updateAcceptanceCriterionStatus: async (id, criterionId, status, notes) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.updateAcceptanceCriterionStatus(
        id,
        criterionId,
        status,
        notes,
        orgId ? orgId.toString() : undefined
      );
      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to update acceptance criterion status',
        actionLoading: false,
      });
      return null;
    }
  },

  removeAcceptanceCriterion: async (id, criterionId) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.removeAcceptanceCriterion(id, criterionId, orgId ? orgId.toString() : undefined);
      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to remove acceptance criterion',
        actionLoading: false,
      });
      return null;
    }
  },

  addProofOfWork: async (id, proofData) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.addProofOfWork(id, proofData, orgId ? orgId.toString() : undefined);
      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to add proof of work',
        actionLoading: false,
      });
      return null;
    }
  },

  removeProofOfWork: async (id, proofId) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const orgId = activeOrganization?.id;
    set({ actionLoading: true, error: null });
    try {
      const updated = await WorkAssignmentService.removeProofOfWork(id, proofId, orgId ? orgId.toString() : undefined);
      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? updated : a)),
        myAssignments: state.myAssignments.map((a) => (a.id === id ? updated : a)),
        selectedAssignment: state.selectedAssignment?.id === id ? updated : state.selectedAssignment,
        actionLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to remove proof of work',
        actionLoading: false,
      });
      return null;
    }
  },

  addLocalAssignment: (assignment) => {
    set((state) => {
      const exists = state.assignments.some((a) => a.id === assignment.id);
      if (exists) return state;
      return { assignments: [assignment, ...state.assignments] };
    });
  },

  updateLocalAssignment: (id, updates) => {
    set((state) => ({
      assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      myAssignments: state.myAssignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      selectedAssignment:
        state.selectedAssignment?.id === id ? { ...state.selectedAssignment, ...updates } : state.selectedAssignment,
    }));
  },

  removeLocalAssignment: (id) => {
    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== id),
      myAssignments: state.myAssignments.filter((a) => a.id !== id),
      selectedAssignment: state.selectedAssignment?.id === id ? null : state.selectedAssignment,
    }));
  },
}));
