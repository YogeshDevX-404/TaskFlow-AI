import { axiosInstance } from './axiosInstance';
import { TaskTreeNode, HierarchyFilters } from '../../types/hierarchy';
import { Task } from '../../types/task';

export const hierarchyService = {
  /**
   * Fetch task hierarchy tree
   */
  async getTaskTree(targetId: string, filters: HierarchyFilters = {}): Promise<TaskTreeNode[]> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.onlyParent) params.append('onlyParent', 'true');
    if (filters.onlySubtasks) params.append('onlySubtasks', 'true');
    if (filters.blocked) params.append('blocked', 'true');
    if (filters.completed) params.append('completed', 'true');
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const res = await axiosInstance.get(`/tasks/${targetId}/tree?${params.toString()}`);
    return res.data.data;
  },

  /**
   * Create a subtask under parent
   */
  async createSubtask(parentTaskId: string, subtaskData: any): Promise<Task> {
    const res = await axiosInstance.post(`/tasks/${parentTaskId}/subtasks`, subtaskData);
    return res.data.data;
  },

  /**
   * Update a subtask
   */
  async updateSubtask(parentTaskId: string, subtaskId: string, data: any): Promise<Task> {
    const res = await axiosInstance.put(`/tasks/${parentTaskId}/subtasks/${subtaskId}`, data);
    return res.data.data;
  },

  /**
   * Delete a subtask
   */
  async deleteSubtask(parentTaskId: string, subtaskId: string): Promise<boolean> {
    const res = await axiosInstance.delete(`/tasks/${parentTaskId}/subtasks/${subtaskId}`);
    return res.data.success;
  },

  /**
   * Convert task: subtask -> parent OR parent -> subtask
   */
  async convertTask(taskId: string, parentTaskId: string | null): Promise<Task> {
    const res = await axiosInstance.post(`/tasks/${taskId}/convert`, { parentTaskId });
    return res.data.data;
  },
};
