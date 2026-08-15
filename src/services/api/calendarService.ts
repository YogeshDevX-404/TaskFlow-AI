import { axiosInstance } from './axiosInstance';
import { CalendarEvent, CalendarFilters, CalendarEventFormData } from '../../types/calendar';

const INITIAL_MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Platform Architecture & Security Milestone',
    description: 'Finalize multi-tenant RBAC and JWT token refresh mechanisms',
    eventType: 'Milestone',
    startDate: '2026-08-01T09:00:00.000Z',
    endDate: '2026-08-01T17:00:00.000Z',
    allDay: true,
    color: '#6366f1',
    status: 'Completed',
    priority: 'High',
    project: { id: 'proj-1', name: 'TaskFlow AI Platform', projectKey: 'TFA' },
    progress: 100,
    isMilestone: true,
    tags: ['Architecture', 'Security'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'evt-2',
    title: 'v2.4 Major Platform Release',
    description: 'Deploy Sprint Planning, Gantt Chart, & Timeline view modules to production',
    eventType: 'Release',
    startDate: '2026-08-15T00:00:00.000Z',
    endDate: '2026-08-15T23:59:59.000Z',
    allDay: true,
    color: '#10b981',
    status: 'Planned',
    priority: 'Urgent',
    project: { id: 'proj-1', name: 'TaskFlow AI Platform', projectKey: 'TFA' },
    progress: 60,
    isMilestone: true,
    tags: ['Release', 'v2.4'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'evt-3',
    title: 'Sprint 24 Planning & Commitment Review',
    description: 'Cross-team sync to review story point capacity and assign backlog tasks',
    eventType: 'Meeting',
    startDate: '2026-08-10T10:00:00.000Z',
    endDate: '2026-08-10T11:30:00.000Z',
    allDay: false,
    color: '#3b82f6',
    status: 'Planned',
    priority: 'Medium',
    project: { id: 'proj-1', name: 'TaskFlow AI Platform', projectKey: 'TFA' },
    progress: 0,
    isMilestone: false,
    tags: ['Meeting', 'Sync'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'evt-4',
    title: 'SOC2 Security Compliance Audit Deadline',
    description: 'Submit third-party audit logs and access control matrices',
    eventType: 'Deadline',
    startDate: '2026-08-20T17:00:00.000Z',
    endDate: '2026-08-20T17:00:00.000Z',
    allDay: true,
    color: '#f43f5e',
    status: 'Planned',
    priority: 'Urgent',
    project: { id: 'proj-1', name: 'TaskFlow AI Platform', projectKey: 'TFA' },
    progress: 30,
    isMilestone: false,
    tags: ['Compliance', 'Audit'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const calendarService = {
  async getEvents(filters: CalendarFilters = {}): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams();
      if (filters.projectId) params.append('projectId', filters.projectId);
      if (filters.sprintId) params.append('sprintId', filters.sprintId);
      if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
      if (filters.organizationId) params.append('organizationId', filters.organizationId);
      if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);
      if (filters.eventType && filters.eventType !== 'all') params.append('eventType', filters.eventType);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
      if (filters.isMilestone !== undefined) params.append('isMilestone', String(filters.isMilestone));
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await axiosInstance.get(`/calendar/events?${params.toString()}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return INITIAL_MOCK_EVENTS;
    } catch (error) {
      console.warn('API /calendar/events failed, returning fallback events', error);
      let results = [...INITIAL_MOCK_EVENTS];
      if (filters.eventType && filters.eventType !== 'all') {
        results = results.filter((e) => e.eventType === filters.eventType);
      }
      if (filters.projectId) {
        results = results.filter(
          (e) => (typeof e.project === 'object' ? e.project.id : e.project) === filters.projectId
        );
      }
      if (filters.isMilestone !== undefined) {
        results = results.filter((e) => Boolean(e.isMilestone) === filters.isMilestone);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        results = results.filter(
          (e) => e.title.toLowerCase().includes(q) || (e.description && e.description.toLowerCase().includes(q))
        );
      }
      return results;
    }
  },

  async getEventById(id: string): Promise<CalendarEvent> {
    try {
      const res = await axiosInstance.get(`/calendar/events/${id}`);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      throw new Error('Event not found');
    } catch (error) {
      const found = INITIAL_MOCK_EVENTS.find((e) => e.id === id);
      if (found) return found;
      throw error;
    }
  },

  async createEvent(data: CalendarEventFormData): Promise<CalendarEvent> {
    try {
      const res = await axiosInstance.post('/calendar/events', data);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      throw new Error('Failed to create calendar event');
    } catch (error) {
      console.warn('API createEvent failed, using mock event object', error);
      const newEvt: CalendarEvent = {
        id: `evt-${Date.now()}`,
        title: data.title,
        description: data.description || '',
        eventType: data.eventType,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        allDay: data.allDay || false,
        color: data.color || '#6366f1',
        status: data.status,
        priority: data.priority,
        project: data.projectId ? { id: data.projectId, name: 'Project' } : undefined,
        sprint: data.sprintId ? { id: data.sprintId, name: 'Sprint' } : undefined,
        progress: data.progress || 0,
        isMilestone: data.eventType === 'Milestone' || Boolean(data.isMilestone),
        tags: data.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      INITIAL_MOCK_EVENTS.unshift(newEvt);
      return newEvt;
    }
  },

  async updateEvent(id: string, data: Partial<CalendarEventFormData>): Promise<CalendarEvent> {
    try {
      const res = await axiosInstance.put(`/calendar/events/${id}`, data);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      throw new Error('Failed to update event');
    } catch (error) {
      const found = INITIAL_MOCK_EVENTS.find((e) => e.id === id);
      if (found) {
        Object.assign(found, data);
        return found;
      }
      throw error;
    }
  },

  async deleteEvent(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/calendar/events/${id}`);
    } catch (error) {
      const idx = INITIAL_MOCK_EVENTS.findIndex((e) => e.id === id);
      if (idx !== -1) INITIAL_MOCK_EVENTS.splice(idx, 1);
    }
  },
};
