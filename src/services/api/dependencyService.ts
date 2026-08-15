import { axiosInstance } from './axiosInstance';
import { DependencyType, TaskDependency } from '../../types/hierarchy';
import { Task } from '../../types/task';

export const dependencyService = {
  /**
   * Add dependency link
   */
  async addDependency(sourceTaskId: string, targetTaskId: string, type: DependencyType): Promise<Task> {
    const res = await axiosInstance.post(`/tasks/${sourceTaskId}/dependencies`, {
      targetTaskId,
      type,
    });
    return res.data.data;
  },

  /**
   * Remove dependency link
   */
  async removeDependency(sourceTaskId: string, dependencyId: string): Promise<Task> {
    const res = await axiosInstance.delete(`/tasks/${sourceTaskId}/dependencies/${dependencyId}`);
    return res.data.data;
  },

  /**
   * Get task dependencies
   */
  async getDependencies(taskId: string): Promise<TaskDependency[]> {
    const res = await axiosInstance.get(`/tasks/${taskId}/dependencies`);
    return res.data.data;
  },
};
