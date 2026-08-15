import { Task } from '../types/task';

export class TaskSortingService {
  /**
   * Sort array of tasks by sortOrder ascending, falling back to createdAt descending
   */
  public static sortTasksByPosition(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      const orderA = a.sortOrder ?? 0;
      const orderB = b.sortOrder ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }

  /**
   * Group tasks by given field key (status, assignee, priority, labels, project)
   */
  public static groupTasksBy(
    tasks: Task[],
    groupByField: 'status' | 'assignee' | 'priority' | 'labels' | 'project'
  ): Record<string, Task[]> {
    const grouped: Record<string, Task[]> = {};

    tasks.forEach((task) => {
      let key = 'Unassigned';

      if (groupByField === 'status') {
        key = task.status || 'Todo';
      } else if (groupByField === 'priority') {
        key = task.priority || 'Medium';
      } else if (groupByField === 'assignee') {
        if (task.assignee) {
          key =
            typeof task.assignee === 'object'
              ? task.assignee.name || `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || 'Assigned'
              : task.assignee;
        } else {
          key = 'Unassigned';
        }
      } else if (groupByField === 'labels') {
        if (task.labels && task.labels.length > 0) {
          task.labels.forEach((lbl) => {
            if (!grouped[lbl]) grouped[lbl] = [];
            grouped[lbl].push(task);
          });
          return;
        } else {
          key = 'No Label';
        }
      } else if (groupByField === 'project') {
        if (task.project) {
          key =
            typeof task.project === 'object'
              ? task.project.name || task.project.projectKey || 'Project'
              : task.project;
        } else {
          key = 'No Project';
        }
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(task);
    });

    Object.keys(grouped).forEach((k) => {
      grouped[k] = TaskSortingService.sortTasksByPosition(grouped[k]);
    });

    return grouped;
  }
}
