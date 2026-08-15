import { axiosInstance } from './axiosInstance';
import { KanbanFetchResponse, BoardColumn, BoardSettings, BoardFilterOptions } from '../../types/board';

export const boardService = {
  /**
   * Get Kanban Board state for a project
   */
  async getBoard(projectId: string, filters: BoardFilterOptions = {}): Promise<KanbanFetchResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);
    if (filters.reporterId) params.append('reporterId', filters.reporterId);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.dueDate && filters.dueDate !== 'all') params.append('dueDate', filters.dueDate);
    if (filters.isArchived) params.append('isArchived', 'true');
    if (filters.labels && filters.labels.length > 0) {
      params.append('labels', filters.labels.join(','));
    }

    const res = await axiosInstance.get(`/boards/${projectId}?${params.toString()}`);
    return res.data.data;
  },

  /**
   * Update board columns
   */
  async updateColumns(projectId: string, columns: BoardColumn[]): Promise<any> {
    const res = await axiosInstance.put(`/boards/${projectId}/columns`, { columns });
    return res.data.data;
  },

  /**
   * Add a column
   */
  async addColumn(projectId: string, colData: Partial<BoardColumn>): Promise<any> {
    const res = await axiosInstance.post(`/boards/${projectId}/columns`, colData);
    return res.data.data;
  },

  /**
   * Rename or edit a column
   */
  async updateColumn(projectId: string, columnId: string, updates: Partial<BoardColumn>): Promise<any> {
    const res = await axiosInstance.put(`/boards/${projectId}/columns/${columnId}`, updates);
    return res.data.data;
  },

  /**
   * Delete a column
   */
  async deleteColumn(projectId: string, columnId: string): Promise<any> {
    const res = await axiosInstance.delete(`/boards/${projectId}/columns/${columnId}`);
    return res.data.data;
  },

  /**
   * Update board settings
   */
  async updateSettings(projectId: string, settings: Partial<BoardSettings>): Promise<any> {
    const res = await axiosInstance.put(`/boards/${projectId}/settings`, settings);
    return res.data.data;
  },

  /**
   * Perform bulk actions on selected tasks
   */
  async bulkUpdateTasks(projectId: string, taskIds: string[], updates: any): Promise<boolean> {
    const res = await axiosInstance.post(`/boards/${projectId}/bulk-tasks`, {
      taskIds,
      updates,
    });
    return res.data.success;
  },
};
