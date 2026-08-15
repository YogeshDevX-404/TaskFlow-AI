import { axiosInstance } from './axiosInstance';
import {
  Release,
  ReleaseFilters,
  ReleaseFormData,
  RoadmapData,
  RoadmapViewMode,
} from '../../types/release';

const MOCK_RELEASES: Release[] = [
  {
    id: 'rel-1',
    name: 'v1.0 - Alpha Platform Core',
    version: '1.0.0-alpha',
    description: 'Initial platform baseline with JWT Authentication, Workspaces, and Sprint boards.',
    status: 'Released',
    releaseDate: '2026-07-31',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    color: '#10b981',
    icon: 'rocket',
    project: { id: 'proj-1', name: 'TaskFlow AI Platform', projectKey: 'TFA', color: '#6366f1' },
    milestones: [
      {
        id: 'm-1',
        title: 'Core DB Schema & Auth',
        targetDate: '2026-07-15',
        status: 'Achieved',
        description: 'Mongoose models & JWT validation',
        isCompleted: true,
      },
      {
        id: 'm-2',
        title: 'RBAC Security Policies',
        targetDate: '2026-07-28',
        status: 'Achieved',
        description: 'Role permissions and organization scoping',
        isCompleted: true,
      },
    ],
    goals: [
      { id: 'g-1', title: 'Zero critical security bugs', type: 'Technical', status: 'Achieved' },
      { id: 'g-2', title: '100% tenant workspace isolation', type: 'Business', status: 'Achieved' },
    ],
    tasks: [],
    progress: 100,
    totalTasks: 18,
    completedTasks: 18,
    remainingTasks: 0,
    openBugs: 0,
    blockedWork: 0,
    isArchived: false,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-31T00:00:00.000Z',
  },
  {
    id: 'rel-2',
    name: 'v1.5 - Enterprise Calendar & Sprints',
    version: '1.5.0',
    description: 'Advanced Calendar, Timeline, Gantt chart, and Sprint planning views.',
    status: 'In Development',
    releaseDate: '2026-08-20',
    startDate: '2026-08-01',
    endDate: '2026-08-20',
    color: '#6366f1',
    icon: 'calendar',
    project: { id: 'proj-1', name: 'TaskFlow AI Platform', projectKey: 'TFA', color: '#6366f1' },
    milestones: [
      {
        id: 'm-3',
        title: 'Calendar & Event Modal',
        targetDate: '2026-08-08',
        status: 'Achieved',
        description: 'Drag & drop month/week views with color tagging',
        isCompleted: true,
      },
      {
        id: 'm-4',
        title: 'Gantt Chart & Task Dependencies',
        targetDate: '2026-08-14',
        status: 'In Progress',
        description: 'Critical path and interactive timeline bars',
        isCompleted: false,
      },
    ],
    goals: [
      { id: 'g-3', title: 'Interactive Gantt visualizer', type: 'Release', status: 'In Progress' },
      { id: 'g-4', title: 'Sub-second response on 500+ tasks', type: 'Technical', status: 'In Progress' },
    ],
    tasks: [],
    progress: 68,
    totalTasks: 25,
    completedTasks: 17,
    remainingTasks: 8,
    openBugs: 2,
    blockedWork: 1,
    isArchived: false,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-08T00:00:00.000Z',
  },
  {
    id: 'rel-3',
    name: 'v2.0 - Enterprise Roadmap & Release Engine',
    version: '2.0.0-rc1',
    description: 'Advanced Release Planning, Cross-Project Roadmaps, Versioning, and Delivery tracking.',
    status: 'Scheduled',
    releaseDate: '2026-09-15',
    startDate: '2026-08-15',
    endDate: '2026-09-15',
    color: '#ec4899',
    icon: 'flag',
    project: { id: 'proj-1', name: 'TaskFlow AI Platform', projectKey: 'TFA', color: '#6366f1' },
    milestones: [
      {
        id: 'm-5',
        title: 'Roadmap Timeline View',
        targetDate: '2026-08-25',
        status: 'Upcoming',
        description: 'Quarter, Month, and Week timeline zoom levels',
        isCompleted: false,
      },
      {
        id: 'm-6',
        title: 'Jira/Linear Style Versioning',
        targetDate: '2026-09-05',
        status: 'Upcoming',
        description: 'Track version status, archiving, and release candidate builds',
        isCompleted: false,
      },
    ],
    goals: [
      { id: 'g-5', title: 'Deliver Advanced Roadmap module', type: 'Business', status: 'Not Started' },
    ],
    tasks: [],
    progress: 20,
    totalTasks: 30,
    completedTasks: 6,
    remainingTasks: 24,
    openBugs: 1,
    blockedWork: 0,
    isArchived: false,
    createdAt: '2026-08-05T00:00:00.000Z',
    updatedAt: '2026-08-08T00:00:00.000Z',
  },
];

export const releaseService = {
  /**
   * Fetch all releases
   */
  async getReleases(filters: ReleaseFilters = {}): Promise<Release[]> {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.projectId) params.append('projectId', filters.projectId);
      if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
      if (filters.organizationId) params.append('organizationId', filters.organizationId);
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
      if (filters.version) params.append('version', filters.version);
      if (filters.ownerId) params.append('ownerId', filters.ownerId);
      if (filters.isArchived !== undefined) params.append('isArchived', String(filters.isArchived));
      if (filters.sort) params.append('sort', filters.sort);

      const res = await axiosInstance.get(`/releases?${params.toString()}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return MOCK_RELEASES;
    } catch (error) {
      console.warn('API /releases call failed, using mock release fallback data', error);
      let result = [...MOCK_RELEASES];
      if (filters.status && filters.status !== 'all') {
        result = result.filter((r) => r.status === filters.status);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        result = result.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.version.toLowerCase().includes(q) ||
            (r.description && r.description.toLowerCase().includes(q))
        );
      }
      return result;
    }
  },

  /**
   * Get single release by ID
   */
  async getReleaseById(id: string): Promise<Release> {
    try {
      const res = await axiosInstance.get(`/releases/${id}`);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      throw new Error('Release not found');
    } catch (error) {
      const found = MOCK_RELEASES.find((r) => r.id === id);
      if (found) return found;
      throw error;
    }
  },

  /**
   * Create Release
   */
  async createRelease(data: ReleaseFormData): Promise<Release> {
    try {
      const res = await axiosInstance.post('/releases', data);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      throw new Error('Failed to create release');
    } catch (error) {
      console.warn('API createRelease failed, creating local release object', error);
      const newRelease: Release = {
        id: `rel-${Date.now()}`,
        name: data.name,
        version: data.version,
        description: data.description || '',
        status: data.status || 'Planning',
        releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
        startDate: data.startDate,
        endDate: data.endDate,
        color: data.color || '#6366f1',
        icon: data.icon || 'rocket',
        milestones: data.milestones || [],
        goals: data.goals || [],
        tasks: [],
        progress: 0,
        totalTasks: 0,
        completedTasks: 0,
        remainingTasks: 0,
        openBugs: 0,
        blockedWork: 0,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_RELEASES.unshift(newRelease);
      return newRelease;
    }
  },

  /**
   * Update Release
   */
  async updateRelease(id: string, data: Partial<ReleaseFormData>): Promise<Release> {
    try {
      const res = await axiosInstance.put(`/releases/${id}`, data);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      throw new Error('Failed to update release');
    } catch (error) {
      const found = MOCK_RELEASES.find((r) => r.id === id);
      if (found) {
        Object.assign(found, data);
        found.updatedAt = new Date().toISOString();
        return found;
      }
      throw error;
    }
  },

  /**
   * Delete Release
   */
  async deleteRelease(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/releases/${id}`);
    } catch (error) {
      const idx = MOCK_RELEASES.findIndex((r) => r.id === id);
      if (idx !== -1) MOCK_RELEASES.splice(idx, 1);
    }
  },

  /**
   * Archive / Restore Release
   */
  async archiveRelease(id: string, isArchived: boolean = true): Promise<Release> {
    try {
      const res = await axiosInstance.post(`/releases/${id}/archive`, { isArchived });
      return res.data.data;
    } catch (error) {
      const found = MOCK_RELEASES.find((r) => r.id === id);
      if (found) {
        found.isArchived = isArchived;
        found.status = isArchived ? 'Archived' : 'Planning';
        return found;
      }
      throw error;
    }
  },

  /**
   * Duplicate Release
   */
  async duplicateRelease(id: string): Promise<Release> {
    try {
      const res = await axiosInstance.post(`/releases/${id}/duplicate`);
      return res.data.data;
    } catch (error) {
      const found = MOCK_RELEASES.find((r) => r.id === id);
      if (found) {
        const copy: Release = {
          ...found,
          id: `rel-${Date.now()}`,
          name: `${found.name} (Copy)`,
          version: `${found.version}-copy`,
          status: 'Planning',
          progress: 0,
          completedTasks: 0,
        };
        MOCK_RELEASES.unshift(copy);
        return copy;
      }
      throw error;
    }
  },

  /**
   * Add tasks to Release
   */
  async addTasksToRelease(id: string, taskIds: string[]): Promise<Release> {
    try {
      const res = await axiosInstance.post(`/releases/${id}/tasks`, { taskIds });
      return res.data.data;
    } catch (error) {
      const found = MOCK_RELEASES.find((r) => r.id === id);
      if (found) {
        found.totalTasks += taskIds.length;
        found.remainingTasks += taskIds.length;
        return found;
      }
      throw error;
    }
  },

  /**
   * Fetch Roadmap aggregated data
   */
  async getRoadmapData(
    filters: ReleaseFilters = {},
    viewMode: RoadmapViewMode = 'quarter'
  ): Promise<RoadmapData> {
    try {
      const params = new URLSearchParams();
      if (filters.projectId) params.append('projectId', filters.projectId);
      if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
      if (filters.organizationId) params.append('organizationId', filters.organizationId);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.version) params.append('version', filters.version);
      if (viewMode) params.append('viewMode', viewMode);

      const res = await axiosInstance.get(`/roadmap?${params.toString()}`);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      throw new Error('Failed to load roadmap');
    } catch (error) {
      console.warn('API /roadmap call failed, computing fallback roadmap data', error);
      const releases = await this.getReleases(filters);
      let totalTasks = 0;
      let completedTasks = 0;
      let remainingTasks = 0;
      let openBugs = 0;
      let blockedWork = 0;

      let upcomingCount = 0;
      let currentCount = 0;
      let completedCount = 0;

      releases.forEach((rel) => {
        totalTasks += rel.totalTasks || 0;
        completedTasks += rel.completedTasks || 0;
        remainingTasks += rel.remainingTasks || 0;
        openBugs += rel.openBugs || 0;
        blockedWork += rel.blockedWork || 0;

        if (rel.status === 'Released' || rel.status === 'Ready') completedCount++;
        else if (rel.status === 'In Development' || rel.status === 'Testing') currentCount++;
        else upcomingCount++;
      });

      return {
        releases,
        projects: [],
        sprints: [],
        summary: {
          totalReleases: releases.length,
          upcomingReleases: upcomingCount,
          currentReleases: currentCount,
          completedReleases: completedCount,
          totalTasks,
          completedTasks,
          remainingTasks,
          openBugs,
          blockedWork,
          overallProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
      };
    }
  },
};
