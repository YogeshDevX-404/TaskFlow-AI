import React from 'react';
import { Search, Filter, ArrowUpDown, User, AtSign, Check, X } from 'lucide-react';
import { CommentFilterOptions } from '../../../types/comment';
import { useAuthStore } from '../../../store/useAuthStore';
import { useMemberStore } from '../../../store/useMemberStore';

interface CommentFilterBarProps {
  filters: CommentFilterOptions;
  onFilterChange: (newFilters: Partial<CommentFilterOptions>) => void;
  commentCount: number;
}

export const CommentFilterBar: React.FC<CommentFilterBarProps> = ({
  filters,
  onFilterChange,
  commentCount,
}) => {
  const { user } = useAuthStore();
  const { members } = useMemberStore();

  const isMentionedMeActive = filters.mentionedUserId === user?.id;
  const hasActiveFilters =
    filters.search ||
    filters.authorId ||
    filters.editedOnly ||
    isMentionedMeActive ||
    filters.sortBy !== 'newest';

  const handleResetFilters = () => {
    onFilterChange({
      search: '',
      authorId: undefined,
      mentionedUserId: undefined,
      editedOnly: false,
      sortBy: 'newest',
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
      {/* Title & Count */}
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Activity & Discussion
        </h3>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {commentCount}
        </span>
      </div>

      {/* Filter controls */}
      <div className="flex items-center flex-wrap gap-2 text-xs">
        {/* Search */}
        <div className="relative flex-1 sm:w-40">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search comments..."
            className="w-full pl-8 pr-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Mentioned Me Filter */}
        {user?.id && (
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                mentionedUserId: isMentionedMeActive ? undefined : user.id,
              })
            }
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
              isMentionedMeActive
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <AtSign className="w-3 h-3" />
            <span>@Me</span>
          </button>
        )}

        {/* Edited Filter */}
        <button
          type="button"
          onClick={() => onFilterChange({ editedOnly: !filters.editedOnly })}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
            filters.editedOnly
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <span>Edited</span>
        </button>

        {/* Sort Order */}
        <div className="relative">
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as 'newest' | 'oldest' })}
            className="pl-2 pr-6 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none appearance-none cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <ArrowUpDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Reset filters"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
