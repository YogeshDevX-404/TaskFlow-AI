import { axiosInstance } from './axiosInstance';
import { Sprint, SprintFilters, SprintFormData, SprintSortOption } from '../../types/sprint';

const MOCK_SPRINTS: Sprint[] = [
  {
    id: 'sprint-1',
    name: 'Sprint 24 - Core Architecture',
    goal: 'Complete RBAC permissions and Sprint Planning Board integration',
    description: 'Focus on system modularity, enterprise security, and sprint execution workflows.',
    status: 'Active',
    startDate: '2026-08-01',
    endDate: '2026-08-15',
    project: { id: 'proj-1', name: 'TaskFlow AI Platform', projectKey: 'TFA' },
    velocity: 0,
    capacity: 40,
    tasks: [],
    taskIds: ['task-1', 'task-2', 'task-3'],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sprint-2',
    name: 'Sprint 25 - Enterprise Analytics & Reports',
    goal: 'Build velocity charts, burndown placeholders, and export features',
    description: 'Implement reporting dashboards for managers and executive stakeholders.',
    status: 'Planning',
    startDate: '2026-08-16',
    endDate: '2026-08-30',
    project: { id: 'proj-1', name: 'TaskFlow AI Platform', projectKey: 'TFA' },
    velocity: 0,
    capacity: 45,
    tasks: [],
    taskIds: ['task-4', 'task-5'],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sprint-3',
    name: 'Sprint 23 - Authentication & Workspace Onboarding',
    goal: 'Deliver JWT authentication, MFA placeholders, and organization switcher',
    description: 'Completed milestone for client enterprise security baseline.',
    status: 'Completed',
    startDate: '2026-07-15',
    endDate: '2026-07-30',
    completedDate: '2026-07-30',
    project: { id: 'proj-1', name: 'TaskFlow AI Platform', projectKey: 'TFA' },
    velocity: 38,
    capacity: 40,
    tasks: [],
    taskIds: [],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const sprintService = {
  /**
   * Get all sprints with filters & sorting
   */
  async getSprints(filters: SprintFilters = {}, sort: SprintSortOption = 'newest'): Promise<Sprint[]> {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.projectId) params.append('projectId', filters.projectId);
      if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
      if (filters.organizationId) params.append('organizationId', filters.organizationId);
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
      if (filters.ownerId) params.append('ownerId', filters.ownerId);
      if (filters.isArchived !== undefined) params.append('isArchived', String(filters.isArchived));
      if (sort) params.append('sort', sort);

      const res = await axiosInstance.get(`/sprints?${params.toString()}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return MOCK_SPRINTS;
    } catch (error) {
      console.warn('API /sprints call failed, using mock fallback data', error);
      let result = [...MOCK_SPRINTS];
      if (filters.projectId) {
        result = result.filter(
          (s) => (typeof s.project === 'object' ? s.project.id : s.project) === filters.projectId
        );
      }
      if (filters.status && filters.status !== 'all') {
        result = result.filter((s) => s.status === filters.status);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        result = result.filter(
          (s) => s.name.toLowerCase().includes(q) || (s.goal && s.goal.toLowerCase().includes(q))
        );
      }
      return result;
    }
  },

  /**
   * Get single sprint by ID
   */
  async getSprintById(id: string): Promise<Sprint> {
    try {
      const res = await axiosInstance.get(`/sprints/${id}`);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      throw new Error('Sprint not found');
    } catch (error) {
      const found = MOCK_SPRINTS.find((s) => s.id === id);
      if (found) return found;
      throw error;
    }
  },

  /**
   * Create Sprint
   */
  async createSprint(data: SprintFormData): Promise<Sprint> {
    try {
      const res = await axiosInstance.post('/sprints', data);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      throw new Error('Failed to create sprint');
    } catch (error) {
      console.warn('API createSprint failed, creating client side sprint object', error);
      const newSprint: Sprint = {
        id: `sprint-${Date.now()}`,
        name: data.name,
        goal: data.goal || '',
        description: data.description || '',
        status: data.status || 'Planning',
        startDate: data.startDate,
        endDate: data.endDate,
        capacity: data.capacity || 0,
        velocity: 0,
        project: { id: data.projectId, name: 'Current Project' },
        tasks: [],
        taskIds: [],
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_SPRINTS.unshift(newSprint);
      return newSprint;
    }
  },

  /**
   * Update Sprint
   */
  async updateSprint(id: string, data: Partial<SprintFormData & { status?: Sprint['status']; velocity?: number }>): Promise<Sprint> {
    try {
      const res = await axiosInstance.put(`/sprints/${id}`, data);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      throw new Error('Failed to update sprint');
    } catch (error) {
      const found = MOCK_SPRINTS.find((s) => s.id === id);
      if (found) {
        Object.assign(found, data);
        return found;
      }
      throw error;
    }
  },

  /**
   * Delete Sprint
   */
  async deleteSprint(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/sprints/${id}`);
    } catch (error) {
      const idx = MOCK_SPRINTS.findIndex((s) => s.id === id);
      if (idx !== -1) MOCK_SPRINTS.splice(idx, 1);
    }
  },

  /**
   * Archive / Restore Sprint
   */
  async archiveSprint(id: string, isArchived: boolean = true): Promise<Sprint> {
    try {
      const res = await axiosInstance.patch(`/sprints/${id}/archive`, { isArchived });
      return res.data.data;
    } catch (error) {
      const found = MOCK_SPRINTS.find((s) => s.id === id);
      if (found) {
        found.isArchived = isArchived;
        return found;
      }
      throw error;
    }
  },

  /**
   * Duplicate Sprint
   */
  async duplicateSprint(id: string): Promise<Sprint> {
    try {
      const res = await axiosInstance.post(`/sprints/${id}/duplicate`);
      return res.data.data;
    } catch (error) {
      const found = MOCK_SPRINTS.find((s) => s.id === id);
      if (found) {
        const copy: Sprint = {
          ...found,
          id: `sprint-${Date.now()}`,
          name: `${found.name} (Copy)`,
          status: 'Planning',
          tasks: [],
          taskIds: [],
        };
        MOCK_SPRINTS.unshift(copy);
        return copy;
      }
      throw error;
    }
  },

  /**
   * Start Sprint
   */
  async startSprint(id: string): Promise<Sprint> {
    try {
      const res = await axiosInstance.patch(`/sprints/${id}/start`);
      return res.data.data;
    } catch (error) {
      const found = MOCK_SPRINTS.find((s) => s.id === id);
      if (found) {
        found.status = 'Active';
        if (!found.startDate) found.startDate = new Date().toISOString().split('T')[0];
        return found;
      }
      throw error;
    }
  },

  /**
   * Complete Sprint
   */
  async completeSprint(id: string, moveUnfinishedToSprintId?: string): Promise<Sprint> {
    try {
      const res = await axiosInstance.patch(`/sprints/${id}/complete`, { moveUnfinishedToSprintId });
      return res.data.data;
    } catch (error) {
      const found = MOCK_SPRINTS.find((s) => s.id === id);
      if (found) {
        found.status = 'Completed';
        found.completedDate = new Date().toISOString();
        return found;
      }
      throw error;
    }
  },

  /**
   * Cancel Sprint
   */
  async cancelSprint(id: string): Promise<Sprint> {
    try {
      const res = await axiosInstance.patch(`/sprints/${id}/cancel`);
      return res.data.data;
    } catch (error) {
      const found = MOCK_SPRINTS.find((s) => s.id === id);
      if (found) {
        found.status = 'Cancelled';
        return found;
      }
      throw error;
    }
  },

  /**
   * Add tasks to sprint
   */
  async addTasksToSprint(id: string, taskIds: string[]): Promise<Sprint> {
    try {
      const res = await axiosInstance.post(`/sprints/${id}/tasks`, { taskIds });
      return res.data.data;
    } catch (error) {
      const found = MOCK_SPRINTS.find((s) => s.id === id);
      if (found) {
        const existing = new Set(found.taskIds || []);
        taskIds.forEach((t) => existing.add(t));
        found.taskIds = Array.from(existing);
        return found;
      }
      throw error;
    }
  },

  /**
   * Remove tasks from sprint
   */
  async removeTasksFromSprint(id: string, taskIds: string[]): Promise<Sprint> {
    try {
      const res = await axiosInstance.delete(`/sprints/${id}/tasks`, { data: { taskIds } });
      return res.data.data;
    } catch (error) {
      const found = MOCK_SPRINTS.find((s) => s.id === id);
      if (found && found.taskIds) {
        const removeSet = new Set(taskIds);
        found.taskIds = found.taskIds.filter((t) => !removeSet.has(t));
        return found;
      }
      throw error;
    }
  },

  /**
   * Get sprint burndown data
   */
  async getBurndown(id: string): Promise<Array<{ date: string; idealRemaining: number; actualRemaining: number | null }>> {
    try {
      const res = await axiosInstance.get(`/sprints/${id}/burndown`);
      return res.data.data;
    } catch {
      return [];
    }
  },

  /**
   * Get sprint burnup data
   */
  async getBurnup(id: string): Promise<Array<{ date: string; totalScope: number | null; completed: number | null; remaining: number | null }>> {
    try {
      const res = await axiosInstance.get(`/sprints/${id}/burnup`);
      return res.data.data;
    } catch {
      return [];
    }
  },

  /**
   * Get sprint retrospective details
   */
  async getRetrospective(id: string): Promise<any> {
    try {
      const res = await axiosInstance.get(`/sprints/${id}/retrospective`);
      return res.data.data;
    } catch {
      return null;
    }
  },

  /**
   * Update sprint retrospective details
   */
  async updateRetrospective(id: string, data: any): Promise<any> {
    const res = await axiosInstance.post(`/sprints/${id}/retrospective`, data);
    return res.data.data;
  },

  /**
   * Get sprint activity timeline logs
   */
  async getSprintActivity(id: string): Promise<any[]> {
    try {
      const res = await axiosInstance.get(`/sprints/${id}/activity`);
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Get historical project sprints velocity metrics
   */
  async getProjectVelocity(projectId: string): Promise<{ history: Array<{ sprintName: string; completedPoints: number; capacity: number }>; average: number }> {
    try {
      const res = await axiosInstance.get(`/sprints/project/${projectId}/velocity`);
      return res.data.data;
    } catch {
      return { history: [], average: 0 };
    }
  },
};

