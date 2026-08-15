import React, { useState } from 'react';
import { IGitHubRepo } from '../../services/api/githubIntegrationService';
import {
  X,
  Star,
  GitFork,
  AlertCircle,
  ExternalLink,
  Lock,
  Globe,
  Archive,
  GitBranch,
  Calendar,
  CheckCircle2,
  FolderGit2,
  PlusCircle,
} from 'lucide-react';

interface RepositoryDetailsModalProps {
  repository: IGitHubRepo | null;
  onClose: () => void;
  onConnect?: (repo: IGitHubRepo) => void;
  isConnected?: boolean;
}

export const RepositoryDetailsModal: React.FC<RepositoryDetailsModalProps> = ({
  repository,
  onClose,
  onConnect,
  isConnected = false,
}) => {
  if (!repository) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div
        id="github-repo-details-modal"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-6 animate-in zoom-in-95"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 pr-8">
          <img
            src={repository.owner.avatar_url}
            alt={repository.owner.login}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500">
                {repository.owner.login}
              </span>
              {repository.visibility === 'private' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Lock className="w-2.5 h-2.5" /> Private
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Globe className="w-2.5 h-2.5" /> Public
                </span>
              )}
              {repository.archived && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                  <Archive className="w-2.5 h-2.5" /> Archived
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {repository.name}
            </h2>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Repository Description
          </span>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {repository.description || 'No description provided for this repository.'}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Default Branch</span>
            <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-900 dark:text-white">
              <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
              <span>{repository.default_branch}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Primary Language</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>{repository.language || 'None'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Stargazers</span>
            <div className="flex items-center gap-1.5 font-semibold text-amber-500">
              <Star className="w-3.5 h-3.5" />
              <span>{repository.stargazers_count}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Forks</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <GitFork className="w-3.5 h-3.5" />
              <span>{repository.forks_count}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Open Issues</span>
            <div className="flex items-center gap-1.5 font-semibold text-rose-500">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{repository.open_issues_count}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Last Updated</span>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(repository.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </a>

          {isConnected ? (
            <span className="px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Connected to Project
            </span>
          ) : (
            onConnect && (
              <button
                type="button"
                onClick={() => {
                  onConnect(repository);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Connect to Project
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
