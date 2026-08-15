import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { useDeveloperDeepDive } from '../../hooks/useDeveloperActivity';
import { ActivityAnalyticsFilters } from '../../types/activityAnalytics';
import { ContributionHeatmap } from './ContributionHeatmap';
import { WorkPatternHeatmap } from './WorkPatternHeatmap';
import {
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  ExternalLink,
  Shield,
  Layers,
  Clock,
  Github,
  CheckCircle,
  Clock3,
  FileCode,
  Tag,
} from 'lucide-react';
import { Spinner } from '../ui/Spinner';

interface DeveloperDetailDrawerProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  filters?: ActivityAnalyticsFilters;
}

type DrawerTab = 'overview' | 'commits' | 'pull-requests' | 'tasks' | 'work-patterns';

export const DeveloperDetailDrawer: React.FC<DeveloperDetailDrawerProps> = ({
  userId,
  isOpen,
  onClose,
  filters,
}) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
  const { data: deepDive, isLoading } = useDeveloperDeepDive(userId, filters);

  const developer = deepDive?.developer;
  const stats = deepDive?.stats;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="max-w-4xl">
      {isLoading || !developer ? (
        <div className="flex flex-col items-center justify-center h-96 gap-3">
          <Spinner />
          <p className="text-xs text-slate-500 font-medium">Loading developer contribution analytics...</p>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Developer Header Banner */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {developer.avatar ? (
                    <img
                      src={developer.avatar}
                      alt={developer.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                      {developer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {developer.githubConnected && (
                    <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white p-1 rounded-full border border-white dark:border-slate-800 shadow-xs">
                      <Github className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{developer.name}</h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                      {developer.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{developer.email}</p>

                  {developer.githubUsername && (
                    <a
                      href={`https://github.com/${developer.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 mt-1"
                    >
                      <Github className="w-3 h-3" />
                      @{developer.githubUsername}
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Quick High-Level Metrics */}
              <div className="flex items-center gap-2">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center min-w-[80px]">
                  <span className="text-[10px] text-slate-400 font-semibold block">Total Acts</span>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                    {stats?.totalContributions || 0}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center min-w-[80px]">
                  <span className="text-[10px] text-slate-400 font-semibold block">Commits</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {stats?.totalCommits || 0}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center min-w-[80px]">
                  <span className="text-[10px] text-slate-400 font-semibold block">Merged PRs</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {stats?.mergedPRs || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 mt-6 border-b border-slate-200/80 dark:border-slate-800 -mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Overview & Heatmap
              </button>
              <button
                onClick={() => setActiveTab('commits')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'commits'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <GitCommit className="w-3.5 h-3.5" />
                Commits ({deepDive.recentCommits?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('pull-requests')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pull-requests'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                Pull Requests ({deepDive.recentPullRequests?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'tasks'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tasks ({deepDive.recentTasks?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('work-patterns')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'work-patterns'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Work Patterns
              </button>
            </div>
          </div>

          {/* Drawer Body Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 365-Day Contribution Heatmap */}
                <ContributionHeatmap
                  days={deepDive.heatmap}
                  title={`${developer.name}'s Contribution Matrix`}
                  subtitle="Recorded git commits, pull requests, code reviews and task milestones over the past year"
                />

                {/* Work Patterns summary */}
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Work Rhythm & Velocity</h4>
                  <WorkPatternHeatmap
                    byHour={deepDive.workPatterns.byHour}
                    byWeekday={deepDive.workPatterns.byWeekday}
                  />
                </div>
              </div>
            )}

            {activeTab === 'commits' && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Recent Git Commits</h4>
                {deepDive.recentCommits?.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    No commit records found in this time range.
                  </div>
                ) : (
                  deepDive.recentCommits?.map((commit) => (
                    <div
                      key={commit.id}
                      className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                          <GitCommit className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
                            {commit.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-bold">
                              {commit.shortSha}
                            </span>
                            <span>•</span>
                            <span>{commit.repositoryName}</span>
                            <span>•</span>
                            <span>{new Date(commit.committedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {commit.commitUrl && (
                        <a
                          href={commit.commitUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'pull-requests' && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pull Requests</h4>
                {deepDive.recentPullRequests?.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    No pull requests found in this time range.
                  </div>
                ) : (
                  deepDive.recentPullRequests?.map((pr) => (
                    <div
                      key={pr.id}
                      className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            pr.state === 'merged'
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                              : pr.state === 'open'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          <GitPullRequest className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400 font-bold">#{pr.number}</span>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">{pr.title}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                pr.state === 'merged'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                                  : pr.state === 'open'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {pr.state}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Review: {pr.reviewStatus || 'Pending'}
                            </span>
                            <span className="text-[10px] text-slate-400">• {pr.repositoryName}</span>
                          </div>
                        </div>
                      </div>

                      {pr.githubUrl && (
                        <a
                          href={pr.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Assigned & Completed Tasks</h4>
                {deepDive.recentTasks?.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    No task assignments found for this user.
                  </div>
                ) : (
                  deepDive.recentTasks?.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {task.key}
                            </span>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">{task.title}</p>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {task.projectName} • Priority: {task.priority}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          ['done', 'completed', 'resolved'].includes(task.status.toLowerCase())
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'work-patterns' && (
              <WorkPatternHeatmap
                byHour={deepDive.workPatterns.byHour}
                byWeekday={deepDive.workPatterns.byWeekday}
              />
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
};
