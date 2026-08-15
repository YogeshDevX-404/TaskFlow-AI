import { useMemo } from 'react';
import { useSprintStore } from '../store/useSprintStore';
import { useTaskStore } from '../store/useTaskStore';

export const useCurrentSprint = () => {
  const { activeSprint, currentSprint, isLoading, error } = useSprintStore();
  const { tasks } = useTaskStore();

  const sprint = activeSprint || currentSprint;

  const metrics = useMemo(() => {
    if (!sprint) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        blockedTasks: 0,
        totalPoints: 0,
        completedPoints: 0,
        remainingPoints: 0,
        progressPercentage: 0,
        daysRemaining: 0,
      };
    }

    const sprintTaskIds = new Set(
      Array.isArray(sprint.taskIds)
        ? sprint.taskIds
        : Array.isArray(sprint.tasks)
        ? sprint.tasks.map((t: any) => (typeof t === 'object' ? t.id || t._id : t))
        : []
    );

    // Filter tasks belonging to sprint
    const sprintTasks = tasks.filter(
      (t) =>
        sprintTaskIds.has(t.id) ||
        t.sprint === sprint.id ||
        (typeof t.sprint === 'object' && t.sprint?.id === sprint.id)
    );

    let completedCount = 0;
    let inProgressCount = 0;
    let blockedCount = 0;
    let totalPoints = 0;
    let completedPoints = 0;

    sprintTasks.forEach((t) => {
      const points = t.storyPoints || 0;
      totalPoints += points;

      if (t.status === 'Done') {
        completedCount++;
        completedPoints += points;
      } else if (t.status === 'Blocked') {
        blockedCount++;
      } else if (t.status === 'In Progress' || t.status === 'In Review' || t.status === 'Testing') {
        inProgressCount++;
      }
    });

    const totalTasks = sprintTasks.length;
    const progressPercentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    let daysRemaining = 0;
    if (sprint.endDate) {
      const diffTime = new Date(sprint.endDate).getTime() - new Date().getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    return {
      totalTasks,
      completedTasks: completedCount,
      inProgressTasks: inProgressCount,
      blockedTasks: blockedCount,
      totalPoints,
      completedPoints,
      remainingPoints: totalPoints - completedPoints,
      progressPercentage,
      daysRemaining,
    };
  }, [sprint, tasks]);

  return {
    sprint,
    metrics,
    isLoading,
    error,
  };
};
