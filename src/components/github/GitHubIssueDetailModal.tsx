import React from 'react';
import { IGitHubIssue } from '../../services/api/githubIntegrationService';
import {
  X,
  ExternalLink,
  MessageSquare,
  User,
  Calendar,
  Tag,
  GitPullRequest,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export interface GitHubIssueDetailModalProps {
  issue: IGitHubIssue | null;
  isOpen: boolean;
  onClose: () => void;
  onImportClick?: (issue: IGitHubIssue) => void;
  onLinkClick?: (issue: IGitHubIssue) => void;
}

export const GitHubIssueDetailModal: React.FC<GitHubIssueDetailModalProps> = ({
  issue,
  isOpen,
  onClose,
  onImportClick,
  onLinkClick,
}) => {
  if (!isOpen || !issue) return null;

  const isImported = issue.mappingInfo?.isImported;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2 max-w-[85%]">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  issue.state === 'open'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400'
                }`}
              >
                {issue.state.toUpperCase()}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                #{issue.number}
              </span>
              {isImported && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Mapped to {issue.mappingInfo?.taskKey || 'Task'}</span>
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {issue.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Issue Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Author</div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              {issue.user.avatar_url ? (
                <img
                  src={issue.user.avatar_url}
                  alt={issue.user.login}
                  className="w-4 h-4 rounded-full"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="truncate">{issue.user.login}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created</div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(issue.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comments</div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{issue.comments} comments</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignees</div>
            <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
              {issue.assignees && issue.assignees.length > 0 ? (
                issue.assignees.map((a) => (
                  <span key={a.id} className="truncate">
                    @{a.login}
                  </span>
                ))
              ) : (
                <span className="text-slate-400">Unassigned</span>
              )}
            </div>
          </div>
        </div>

        {/* Labels Section */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Labels</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {issue.labels.map((l) => (
                <span
                  key={l.name}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  style={{
                    backgroundColor: l.color ? `#${l.color}20` : undefined,
                    color: l.color ? `#${l.color}` : undefined,
                  }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description Body */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed custom-scrollbar">
            {issue.body || <span className="italic text-slate-400">No description provided for this issue.</span>}
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <a
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            {!isImported && onLinkClick && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLinkClick(issue);
                }}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Link to Existing Task
              </button>
            )}

            {!isImported && onImportClick && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onImportClick(issue);
                }}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition"
              >
                <span>Import as Task</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {isImported && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Already Imported</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
