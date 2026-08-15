import React from 'react';
import { RepositoryActivityMetric } from '../../types/activityAnalytics';
import { GitBranch, GitCommit, GitPullRequest, Users, ExternalLink, CheckCircle2 } from 'lucide-react';

interface RepositoryVelocityCardProps {
  repositories: RepositoryActivityMetric[];
}

export const RepositoryVelocityCard: React.FC<RepositoryVelocityCardProps> = ({ repositories }) => {
  if (!repositories || repositories.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
        <GitBranch className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h4 className="font-semibold text-slate-800 dark:text-slate-200">No Connected Repositories Found</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Connect GitHub repositories to track commit velocity, pull request throughput, and code contributions.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {repositories.map((repo) => (
        <div
          key={repo.id}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold shrink-0">
                  <GitBranch className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[180px]">
                    {repo.repositoryName}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{repo.fullName}</p>
                </div>
              </div>

              {repo.htmlUrl && (
                <a
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 my-3">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {repo.defaultBranch || 'main'}
              </span>
              {repo.language && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {repo.language}
                </span>
              )}
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {repo.visibility}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-2 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5 flex items-center justify-center gap-1">
                <GitCommit className="w-3 h-3 text-indigo-500" /> Commits
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{repo.commitsCount}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5 flex items-center justify-center gap-1">
                <GitPullRequest className="w-3 h-3 text-violet-500" /> PRs
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{repo.pullRequestsCount}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5 flex items-center justify-center gap-1">
                <Users className="w-3 h-3 text-emerald-500" /> Authors
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{repo.activeContributorsCount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
