import { create } from 'zustand';
import {
  IAssignmentDashboardSummary,
  IDeveloperMonitoringStats,
  IProjectMonitoringStats,
  IAttentionNeededAssignment,
  WorkAssignment,
  IDeveloperDetailedDrilldown,
  IProjectDetailedDrilldown,
} from '../types/workAssignment';
import { WorkAssignmentService } from '../services/api/workAssignmentService';
import { useOrganizationStore } from './useOrganizationStore';
import { useWorkspaceStore } from './useWorkspaceStore';

export type MonitoringTab =
  | 'overview'
  | 'developers'
  | 'review-queue'
  | 'attention-needed'
  | 'projects'
  | 'reports'
  | 'timeline';

export type DateRangePreset = 'all' | 'today' | 'this-week' | 'this-month' | 'overdue';

interface MonitoringFilters {
  workspaceId: string;
  projectId: string;
  assignedToId: string;
  priority: string;
  status: string;
  dateRange: DateRangePreset;
  dateFrom?: string;
  dateTo?: string;
  searchQuery: string;
}

interface WorkAssignmentMonitoringState {
  activeTab: MonitoringTab;
  summary: IAssignmentDashboardSummary | null;
  developerStats: IDeveloperMonitoringStats[];
  projectStats: IProjectMonitoringStats[];
  reviewQueue: WorkAssignment[];
  attentionNeeded: IAttentionNeededAssignment[];
  timeline: any[];
  selectedDeveloper: IDeveloperMonitoringStats | null;
  
  // Drilldowns
  selectedDeveloperDrilldown: IDeveloperDetailedDrilldown | null;
  selectedProjectDrilldown: IProjectDetailedDrilldown | null;
  drilldownLoading: boolean;

  // Reports
  activeReportType: 'summary' | 'developers' | 'projects' | 'overdue' | 'submissions' | 'workload';
  reportData: any | null;
  reportLoading: boolean;

  filters: MonitoringFilters;
  loading: boolean;
  error: string | null;

  // Actions
  setActiveTab: (tab: MonitoringTab) => void;
  setSelectedDeveloper: (dev: IDeveloperMonitoringStats | null) => void;
  setActiveReportType: (reportType: 'summary' | 'developers' | 'projects' | 'overdue' | 'submissions' | 'workload') => void;
  setFilter: <K extends keyof MonitoringFilters>(key: K, value: MonitoringFilters[K]) => void;
  resetFilters: () => void;

  // Fetchers
  fetchAllData: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchDeveloperStats: () => Promise<void>;
  fetchProjectStats: () => Promise<void>;
  fetchReviewQueue: () => Promise<void>;
  fetchAttentionNeeded: () => Promise<void>;
  fetchTimeline: () => Promise<void>;
  fetchReports: (type?: string) => Promise<void>;
  fetchDeveloperDrilldown: (developerId: string) => Promise<void>;
  fetchProjectDrilldown: (projectId: string) => Promise<void>;
  exportCsv: () => Promise<void>;
  clearDrilldowns: () => void;
}

export const useWorkAssignmentMonitoringStore = create<WorkAssignmentMonitoringState>((set, get) => ({
  activeTab: 'overview',
  summary: null,
  developerStats: [],
  projectStats: [],
  reviewQueue: [],
  attentionNeeded: [],
  timeline: [],
  selectedDeveloper: null,
  selectedDeveloperDrilldown: null,
  selectedProjectDrilldown: null,
  drilldownLoading: false,
  activeReportType: 'summary',
  reportData: null,
  reportLoading: false,
  filters: {
    workspaceId: 'all',
    projectId: 'all',
    assignedToId: 'all',
    priority: 'all',
    status: 'all',
    dateRange: 'all',
    searchQuery: '',
  },
  loading: false,
  error: null,

  setActiveTab: (tab) => {
    set({ activeTab: tab });
    if (tab === 'reports') {
      get().fetchReports();
    }
  },
  setSelectedDeveloper: (dev) => set({ selectedDeveloper: dev }),
  setActiveReportType: (activeReportType) => {
    set({ activeReportType });
    get().fetchReports(activeReportType);
  },
  clearDrilldowns: () => {
    set({ selectedDeveloperDrilldown: null, selectedProjectDrilldown: null });
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
    // Re-fetch after filter change
    setTimeout(() => {
      get().fetchAllData();
    }, 50);
  },

  resetFilters: () => {
    set({
      filters: {
        workspaceId: 'all',
        projectId: 'all',
        assignedToId: 'all',
        priority: 'all',
        status: 'all',
        dateRange: 'all',
        searchQuery: '',
      },
    });
    setTimeout(() => {
      get().fetchAllData();
    }, 50);
  },

  fetchAllData: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchSummary(),
        get().fetchDeveloperStats(),
        get().fetchProjectStats(),
        get().fetchReviewQueue(),
        get().fetchAttentionNeeded(),
        get().fetchTimeline(),
      ]);
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch monitoring metrics' });
    } finally {
      set({ loading: false });
    }
  },

  fetchSummary: async () => {
    const { activeOrganization } = useOrganizationStore.getState();
    const { activeWorkspace } = useWorkspaceStore.getState();
    const { filters } = get();
    if (!activeOrganization?.id) return;

    try {
      const workspaceId =
        filters.workspaceId !== 'all'
          ? filters.workspaceId
          : activeWorkspace?.id || undefined;
      const projectId = filters.projectId !== 'all' ? filters.projectId : undefined;
      const assignedToId = filters.assignedToId !== 'all' ? filters.assignedToId : undefined;
      const priority = filters.priority !== 'all' ? filters.priority : undefined;

      let dateFrom = filters.dateFrom;
      let dateTo = filters.dateTo;

      if (filters.dateRange === 'today') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        dateFrom = start.toISOString();
      } else if (filters.dateRange === 'this-week') {
        const now = new Date();
        const start = new Date(now.setDate(now.getDate() - now.getDay()));
        start.setHours(0, 0, 0, 0);
        dateFrom = start.toISOString();
      } else if (filters.dateRange === 'this-month') {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFrom = start.toISOString();
      }

      const summary = await WorkAssignmentService.getDashboardSummary(
        {
          workspaceId,
          projectId,
          assignedToId,
          priority,
          dateFrom,
          dateTo,
        },
        activeOrganization.id
      );

      set({ summary });
    } catch (err: any) {
      console.error('Error fetching dashboard summary:', err);
    }
  },

  fetchDeveloperStats: async () => {
    const { activeOrganization } = useOrganizationStore.getState();
    const { activeWorkspace } = useWorkspaceStore.getState();
    const { filters } = get();
    if (!activeOrganization?.id) return;

    try {
      const workspaceId =
        filters.workspaceId !== 'all'
          ? filters.workspaceId
          : activeWorkspace?.id || undefined;
      const projectId = filters.projectId !== 'all' ? filters.projectId : undefined;

      const developerStats = await WorkAssignmentService.getDeveloperMonitoringStats(
        { workspaceId, projectId },
        activeOrganization.id
      );
      set({ developerStats });
    } catch (err: any) {
      console.error('Error fetching developer stats:', err);
    }
  },

  fetchProjectStats: async () => {
    const { activeOrganization } = useOrganizationStore.getState();
    const { activeWorkspace } = useWorkspaceStore.getState();
    const { filters } = get();
    if (!activeOrganization?.id) return;

    try {
      const workspaceId =
        filters.workspaceId !== 'all'
          ? filters.workspaceId
          : activeWorkspace?.id || undefined;

      const projectStats = await WorkAssignmentService.getProjectMonitoringStats(
        { workspaceId },
        activeOrganization.id
      );
      set({ projectStats });
    } catch (err: any) {
      console.error('Error fetching project stats:', err);
    }
  },

  fetchReviewQueue: async () => {
    const { activeOrganization } = useOrganizationStore.getState();
    const { activeWorkspace } = useWorkspaceStore.getState();
    const { filters } = get();
    if (!activeOrganization?.id) return;

    try {
      const workspaceId =
        filters.workspaceId !== 'all'
          ? filters.workspaceId
          : activeWorkspace?.id || undefined;
      const projectId = filters.projectId !== 'all' ? filters.projectId : undefined;

      const reviewQueue = await WorkAssignmentService.getReviewQueue(
        { workspaceId, projectId },
        activeOrganization.id
      );
      set({ reviewQueue });
    } catch (err: any) {
      console.error('Error fetching review queue:', err);
    }
  },

  fetchAttentionNeeded: async () => {
    const { activeOrganization } = useOrganizationStore.getState();
    const { activeWorkspace } = useWorkspaceStore.getState();
    const { filters } = get();
    if (!activeOrganization?.id) return;

    try {
      const workspaceId =
        filters.workspaceId !== 'all'
          ? filters.workspaceId
          : activeWorkspace?.id || undefined;
      const projectId = filters.projectId !== 'all' ? filters.projectId : undefined;

      const attentionNeeded = await WorkAssignmentService.getAttentionNeeded(
        { workspaceId, projectId },
        activeOrganization.id
      );
      set({ attentionNeeded });
    } catch (err: any) {
      console.error('Error fetching attention needed items:', err);
    }
  },

  fetchTimeline: async () => {
    const { activeOrganization } = useOrganizationStore.getState();
    const { activeWorkspace } = useWorkspaceStore.getState();
    const { filters } = get();
    if (!activeOrganization?.id) return;

    try {
      const workspaceId =
        filters.workspaceId !== 'all'
          ? filters.workspaceId
          : activeWorkspace?.id || undefined;
      const projectId = filters.projectId !== 'all' ? filters.projectId : undefined;

      const timeline = await WorkAssignmentService.getAssignmentTimeline(
        { workspaceId, projectId, limit: 25 },
        activeOrganization.id
      );
      set({ timeline });
    } catch (err: any) {
      console.error('Error fetching assignment timeline:', err);
    }
  },

  fetchReports: async (type?: string) => {
    const { activeOrganization } = useOrganizationStore.getState();
    const { activeWorkspace } = useWorkspaceStore.getState();
    const { filters, activeReportType } = get();
    if (!activeOrganization?.id) return;

    const reportType = type || activeReportType;
    set({ reportLoading: true, error: null });

    try {
      const workspaceId =
        filters.workspaceId !== 'all'
          ? filters.workspaceId
          : activeWorkspace?.id || undefined;
      const projectId = filters.projectId !== 'all' ? filters.projectId : undefined;
      const assignedToId = filters.assignedToId !== 'all' ? filters.assignedToId : undefined;
      const priority = filters.priority !== 'all' ? filters.priority : undefined;
      const status = filters.status !== 'all' ? filters.status : undefined;

      const reportData = await WorkAssignmentService.getReport(
        reportType,
        {
          workspaceId,
          projectId,
          assignedToId,
          priority,
          status,
          dateRangePreset: filters.dateRange !== 'all' ? filters.dateRange.replace('-', '_') : undefined,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        },
        activeOrganization.id
      );

      set({ reportData, reportLoading: false });
    } catch (err: any) {
      console.error('Error fetching report:', err);
      set({ reportLoading: false, error: 'Failed to load report data' });
    }
  },

  fetchDeveloperDrilldown: async (developerId: string) => {
    const { activeOrganization } = useOrganizationStore.getState();
    if (!activeOrganization?.id) return;

    set({ drilldownLoading: true });
    try {
      const details = await WorkAssignmentService.getDeveloperDetails(developerId, activeOrganization.id);
      set({ selectedDeveloperDrilldown: details, drilldownLoading: false });
    } catch (err: any) {
      console.error('Error fetching developer drilldown:', err);
      set({ drilldownLoading: false });
    }
  },

  fetchProjectDrilldown: async (projectId: string) => {
    const { activeOrganization } = useOrganizationStore.getState();
    if (!activeOrganization?.id) return;

    set({ drilldownLoading: true });
    try {
      const details = await WorkAssignmentService.getProjectDetails(projectId, activeOrganization.id);
      set({ selectedProjectDrilldown: details, drilldownLoading: false });
    } catch (err: any) {
      console.error('Error fetching project drilldown:', err);
      set({ drilldownLoading: false });
    }
  },

  exportCsv: async () => {
    const { activeOrganization } = useOrganizationStore.getState();
    const { activeWorkspace } = useWorkspaceStore.getState();
    const { filters } = get();
    if (!activeOrganization?.id) return;

    try {
      const workspaceId =
        filters.workspaceId !== 'all'
          ? filters.workspaceId
          : activeWorkspace?.id || undefined;
      const projectId = filters.projectId !== 'all' ? filters.projectId : undefined;

      const blob = await WorkAssignmentService.exportAssignments(
        {
          workspaceId,
          projectId,
          dateRangePreset: filters.dateRange !== 'all' ? filters.dateRange.replace('-', '_') : undefined,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        },
        activeOrganization.id
      );

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `work-assignments-export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Error exporting assignments:', err);
    }
  },
}));
