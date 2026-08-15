import { axiosInstance } from './axiosInstance';
import { Task, TaskStatus } from '../../types/task';

export const kanbanService = {
  /**
   * Update task status (and position index)
   */
  async updateTaskStatus(taskId: string, status: TaskStatus, newIndex?: number): Promise<Task> {
    const res = await axiosInstance.put(`/tasks/${taskId}/status`, {
      status,
      newIndex,
    });
    return res.data.data;
  },

  /**
   * Reorder array of task IDs in a column or across board
   */
  async reorderTasks(projectId: string, taskIds: string[], status?: TaskStatus): Promise<boolean> {
    const res = await axiosInstance.put('/tasks/reorder', {
      projectId,
      taskIds,
      status,
    });
    return res.data.success;
  },
};
