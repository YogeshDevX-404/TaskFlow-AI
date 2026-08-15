import React from 'react';
import { Calendar, History, ShieldAlert } from 'lucide-react';
import { GroupedTimelineItem, ActivityItem } from '../../types/activity';
import { ActivityTimelineItem } from './ActivityTimelineItem';

interface ActivityTimelineProps {
  groupedTimeline?: GroupedTimelineItem[];
  activities?: ActivityItem[];
  isLoading?: boolean;
  total?: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  groupedTimeline = [],
  activities = [],
  isLoading = false,
  total = 0,
  page = 1,
  totalPages = 1,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="flex gap-4 animate-pulse">
            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasGrouped = groupedTimeline && groupedTimeline.length > 0;
  const hasFlat = activities && activities.length > 0;

  if (!hasGrouped && !hasFlat) {
    return (
      <div className="py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Activity Recorded</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No audit logs or activity events match your active filters or search queries.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {hasGrouped ? (
        groupedTimeline.map((group) => (
          <div key={group.dateKey} className="space-y-4">
            {/* Group Sticky Date Badge Header */}
            <div className="flex items-center gap-2 sticky top-28 z-5 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs py-1.5 px-3 rounded-md w-fit border border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>{group.dateLabel}</span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded-full text-slate-500 dark:text-slate-400 font-bold">
                {group.activities.length}
              </span>
            </div>

            {/* Timeline Items */}
            <div className="pt-2">
              {group.activities.map((act) => (
                <ActivityTimelineItem key={act.id} activity={act} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="pt-2">
          {activities.map((act) => (
            <ActivityTimelineItem key={act.id} activity={act} />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          <div>
            Showing page <span className="font-semibold text-slate-800 dark:text-slate-200">{page}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span> ({total} entries)
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
