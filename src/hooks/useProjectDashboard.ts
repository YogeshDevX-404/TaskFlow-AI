import { useEffect, useMemo } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

export function useProjectDashboard(projectId: string) {
  const {
    dashboardData,
    isLoading,
    error,
    activitySearchQuery,
    activityTypeFilter,
    activityMemberFilter,
    activityDateFilter,
    fetchProjectDashboard,
    setActivitySearchQuery,
    setActivityTypeFilter,
    setActivityMemberFilter,
    setActivityDateFilter,
    resetFilters,
  } = useDashboardStore();

  useEffect(() => {
    if (projectId) {
      fetchProjectDashboard(projectId);
    }
  }, [projectId, fetchProjectDashboard]);

  // Filtered Activity List
  const filteredActivities = useMemo(() => {
    if (!dashboardData?.recentActivity) return [];

    return dashboardData.recentActivity.filter((act) => {
      // Type Filter
      if (activityTypeFilter !== 'all' && act.type !== activityTypeFilter) {
        return false;
      }

      // Member Filter
      if (
        activityMemberFilter !== 'all' &&
        act.actor.name.toLowerCase() !== activityMemberFilter.toLowerCase() &&
        act.actor.email.toLowerCase() !== activityMemberFilter.toLowerCase()
      ) {
        return false;
      }

      // Search Query Filter
      if (activitySearchQuery.trim()) {
        const q = activitySearchQuery.toLowerCase().trim();
        const titleMatch = act.title.toLowerCase().includes(q);
        const descMatch = act.description.toLowerCase().includes(q);
        const actorMatch = act.actor.name.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !actorMatch) return false;
      }

      return true;
    });
  }, [
    dashboardData?.recentActivity,
    activitySearchQuery,
    activityTypeFilter,
    activityMemberFilter,
    activityDateFilter,
  ]);

  return {
    dashboardData,
    isLoading,
    error,
    filteredActivities,
    filters: {
      searchQuery: activitySearchQuery,
      type: activityTypeFilter,
      member: activityMemberFilter,
      date: activityDateFilter,
    },
    actions: {
      setSearchQuery: setActivitySearchQuery,
      setTypeFilter: setActivityTypeFilter,
      setMemberFilter: setActivityMemberFilter,
      setDateFilter: setActivityDateFilter,
      resetFilters,
      refresh: () => fetchProjectDashboard(projectId),
    },
  };
}
