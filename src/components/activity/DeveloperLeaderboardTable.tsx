import React from 'react';
import { DeveloperMetricItem } from '../../types/activityAnalytics';
import {
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Flame,
  Award,
  ChevronRight,
  Github,
  MessageSquare,
  Clock,
  ArrowUpDown,
  Search,
} from 'lucide-react';

interface DeveloperLeaderboardTableProps {
  developers: DeveloperMetricItem[];
  isLoading: boolean;
  onSelectDeveloper: (userId: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export const DeveloperLeaderboardTable: React.FC<DeveloperLeaderboardTableProps> = ({
  developers,
  isLoading,
  onSelectDeveloper,
  search,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  const maxScore = Math.max(1, ...developers.map((d) => d.contributionScore));

  const getRankBadge = (rank?: number) => {
    if (rank === 1) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-xs">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-700/60 text-amber-100 font-black text-xs flex items-center justify-center shadow-xs">
          3
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center">
        {rank || '-'}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Developer Contribution Rankings</h3>
          <span className="text-xs text-slate-400 font-medium">({developers.length} contributors)</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search developer..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 w-44 sm:w-56"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-xs">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="contributionScore">Impact Score</option>
              <option value="totalContributions">Total Contributions</option>
              <option value="commitsCount">Commits</option>
              <option value="prsMergedCount">PRs Merged</option>
              <option value="reviewsCount">Reviews</option>
              <option value="tasksCompletedCount">Tasks Done</option>
              <option value="hoursLogged">Hours Logged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
              <th className="py-3 px-4 w-12 text-center">Rank</th>
              <th className="py-3 px-4 min-w-[200px]">Developer</th>
              <th className="py-3 px-4 min-w-[140px]">Impact & Velocity</th>
              <th className="py-3 px-3 text-center">Commits</th>
              <th className="py-3 px-3 text-center">PRs (M/O)</th>
              <th className="py-3 px-3 text-center">Reviews</th>
              <th className="py-3 px-3 text-center">Tasks Done</th>
              <th className="py-3 px-3 text-center">Hours</th>
              <th className="py-3 px-3 text-center">Streak</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  Loading developer contribution rankings...
                </td>
              </tr>
            ) : developers.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  No contributors found matching current filters.
                </td>
              </tr>
            ) : (
              developers.map((dev) => {
                const scorePercent = Math.min(100, Math.round((dev.contributionScore / maxScore) * 100));

                return (
                  <tr
                    key={dev.userId}
                    onClick={() => onSelectDeveloper(dev.userId)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center">{getRankBadge(dev.impactRank)}</td>

                    {/* Developer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {dev.avatar ? (
                          <img
                            src={dev.avatar}
                            alt={dev.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {dev.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {dev.name}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">
                              {dev.role}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="truncate max-w-[120px]">{dev.email}</span>
                            {dev.githubUsername && (
                              <span className="flex items-center gap-0.5 text-slate-600 dark:text-slate-300 font-mono">
                                <Github className="w-2.5 h-2.5" />
                                @{dev.githubUsername}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Score & Progress */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                            {dev.contributionScore} pts
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {dev.totalContributions} total
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${scorePercent}%` }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                          />
                        </div>
                      </div>
                    </td>

                    {/* Commits */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{dev.commitsCount}</span>
                    </td>

                    {/* PRs */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-bold text-purple-600 dark:text-purple-400">{dev.prsMergedCount}</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-500">{dev.prsOpenedCount}</span>
                      </div>
                    </td>

                    {/* Reviews */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-amber-600 dark:text-amber-400">{dev.reviewsCount}</span>
                    </td>

                    {/* Tasks Completed */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {dev.tasksCompletedCount}
                      </span>
                    </td>

                    {/* Hours */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {dev.hoursLogged > 0 ? `${dev.hoursLogged}h` : '-'}
                      </span>
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-3 text-center">
                      {dev.streakDays > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {dev.streakDays}d
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDeveloper(dev.userId);
                        }}
                        className="p-1.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      >
                        Insights
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
