import React from 'react';
import { IGitHubRepo } from '../../services/api/githubIntegrationService';
import {
  Star,
  GitFork,
  AlertCircle,
  ExternalLink,
  Lock,
  Globe,
  Archive,
  Eye,
  PlusCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface RepositoryCardProps {
  repository: IGitHubRepo;
  isConnected?: boolean;
  onConnect?: (repo: IGitHubRepo) => void;
  onViewDetails?: (repo: IGitHubRepo) => void;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  Python: 'bg-sky-500',
  Go: 'bg-cyan-500',
  Java: 'bg-amber-600',
  Rust: 'bg-orange-600',
  HTML: 'bg-red-500',
  CSS: 'bg-indigo-500',
  Shell: 'bg-emerald-500',
  Ruby: 'bg-rose-600',
  PHP: 'bg-violet-500',
  MDX: 'bg-purple-500',
};

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
  isConnected = false,
  onConnect,
  onViewDetails,
}) => {
  const langColor = LANGUAGE_COLORS[repository.language] || 'bg-slate-400';
  const updatedFormatted = new Date(repository.updated_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id={`github-repo-card-${repository.id}`}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col justify-between group"
    >
      <div className="space-y-3">
        {/* Header Row: Owner Avatar & Title + Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
              className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                {repository.owner.login}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {repository.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {repository.visibility === 'private' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Lock className="w-2.5 h-2.5" />
                Private
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Globe className="w-2.5 h-2.5" />
                Public
              </span>
            )}

            {repository.archived && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                <Archive className="w-2.5 h-2.5" />
                Archived
              </span>
            )}

            {repository.fork && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <GitFork className="w-2.5 h-2.5" />
                Fork
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed min-h-[36px]">
          {repository.description || 'No description provided for this repository.'}
        </p>

        {/* Metadata Chips: Language, Stars, Forks, Issues */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
          {repository.language && (
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${langColor}`} />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {repository.language}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>{repository.stargazers_count.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5 text-slate-400" />
            <span>{repository.forks_count.toLocaleString()}</span>
          </div>

          {repository.open_issues_count > 0 && (
            <div className="flex items-center gap-1 text-slate-500">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>{repository.open_issues_count} open issues</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>Updated {updatedFormatted}</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Open on GitHub"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(repository)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Details
            </button>
          )}

          {isConnected ? (
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected
            </span>
          ) : (
            onConnect && (
              <button
                type="button"
                onClick={() => onConnect(repository)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Connect
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
