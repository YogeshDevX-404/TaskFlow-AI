import { ActivityService, GetActivitiesQueryParams } from './activity.service';
import { IActivityPayload } from '../models/activity.model';

export interface GroupedTimeline {
  dateLabel: string; // 'Today', 'Yesterday', 'August 8, 2026', etc.
  dateKey: string;   // 'YYYY-MM-DD'
  activities: IActivityPayload[];
}

export class TimelineService {
  /**
   * Fetch timeline activities grouped by relative or calendar dates
   */
  public static async GroupedTimeline(
    params: GetActivitiesQueryParams
  ): Promise<{
    groupedTimeline: GroupedTimeline[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { activities, total, page, totalPages } = await ActivityService.getActivities(params);

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const groupsMap = new Map<string, { dateLabel: string; activities: IActivityPayload[] }>();

    activities.forEach((act) => {
      const actDate = new Date(act.createdAt);
      const dateKey = actDate.toISOString().split('T')[0];

      let dateLabel = actDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      if (dateKey === todayStr) {
        dateLabel = 'Today';
      } else if (dateKey === yesterdayStr) {
        dateLabel = 'Yesterday';
      }

      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, { dateLabel, activities: [] });
      }

      groupsMap.get(dateKey)!.activities.push(act);
    });

    const groupedTimeline: GroupedTimeline[] = Array.from(groupsMap.entries()).map(
      ([dateKey, val]) => ({
        dateKey,
        dateLabel: val.dateLabel,
        activities: val.activities,
      })
    );

    return {
      groupedTimeline,
      total,
      page,
      totalPages,
    };
  }
}
