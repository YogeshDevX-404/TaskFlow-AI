import React, { useState } from 'react';
import {
  useGitHubPullRequestDetails,
  useGitHubPullRequestFiles,
  useGitHubPullRequestCommits,
  useGitHubPullRequestReviews,
  useSyncPullRequest,
} from '../../hooks/useGitHubPullRequests';
import {
  GitPullRequest,
  GitMerge,
  XCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  FileCode,
  GitCommit,
  User,
  ExternalLink,
  RefreshCw,
  X,
  ChevronDown,
  ChevronRight,
  GitBranch,
} from 'lucide-react';

interface PullRequestDetailModalProps {
  connectionId: string;
  prNumber: number;
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
}

type ModalTab = 'overview' | 'reviews' | 'commits' | 'files';

export const PullRequestDetailModal: React.FC<PullRequestDetailModalProps> = ({
  connectionId,
  prNumber,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});

  const {
    data: pr,
    isLoading: isPrLoading,
    refetch: refetchPr,
  } = useGitHubPullRequestDetails(connectionId, isOpen ? prNumber : null);

  const { data: files = [], isLoading: isFilesLoading } = useGitHubPullRequestFiles(
    connectionId,
    activeTab === 'files' && isOpen ? prNumber : null
  );

  const { data: commits = [], isLoading: isCommitsLoading } = useGitHubPullRequestCommits(
    connectionId,
    activeTab === 'commits' && isOpen ? prNumber : null
  );

  const { data: reviews = [], isLoading: isReviewsLoading } = useGitHubPullRequestReviews(
    connectionId,
    activeTab === 'reviews' && isOpen ? prNumber : null
  );

  const syncMutation = useSyncPullRequest();

  if (!isOpen) return null;

  const handleSync = () => {
    syncMutation.mutate(
      { connectionId, prNumber },
      {
        onSuccess: () => {
          refetchPr();
        },
      }
    );
  };

  const toggleFilePatch = (filename: string) => {
    setExpandedFiles((prev) => ({ ...prev, [filename]: !prev[filename] }));
  };

  const renderStateBadge = () => {
    if (!pr) return null;
    if (pr.merged) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          <GitMerge className="w-3.5 h-3.5" /> Merged
        </span>
      );
    }
    if (pr.draft) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
          <Clock className="w-3.5 h-3.5" /> Draft
        </span>
      );
    }
    if (pr.state === 'closed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
          <XCircle className="w-3.5 h-3.5" /> Closed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        <GitPullRequest className="w-3.5 h-3.5" /> Open
      </span>
    );
  };

  const renderReviewStatusBadge = () => {
    if (!pr) return null;
    switch (pr.reviewStatus) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'Changes Requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
            <AlertTriangle className="w-3 h-3" /> Changes Requested
          </span>
        );
      case 'Mixed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
            <MessageSquare className="w-3 h-3" /> Review Pending / Mixed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-3 h-3" /> Review Pending
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {renderStateBadge()}
              {renderReviewStatusBadge()}
              <span className="text-xs font-semibold text-slate-400">#{prNumber}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
              {pr?.title || `Pull Request #${prNumber}`}
            </h2>
            {pr && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <strong>{pr.author.login}</strong>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
                    {pr.sourceBranch}
                  </code>
                  <span>→</span>
                  <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
                    {pr.targetBranch}
                  </code>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {pr?.githubUrl && (
              <a
                href={pr.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="View on GitHub"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Re-sync PR state from GitHub"
            >
              <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <GitPullRequest className="w-4 h-4" /> Overview
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Reviews
            {reviews.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {reviews.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('commits')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'commits'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <GitCommit className="w-4 h-4" /> Commits
            {commits.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {commits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'files'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" /> Files Changed
            {files.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {files.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isPrLoading ? (
            <div className="py-12 text-center text-slate-400 animate-pulse">Loading PR details...</div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && pr && (
                <div className="space-y-6">
                  {/* PR Body / Description */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {pr.body || <span className="italic text-slate-400">No description provided.</span>}
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-xs text-slate-400 font-medium">Author</div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        <img
                          src={pr.author.avatar_url}
                          alt={pr.author.login}
                          className="w-5 h-5 rounded-full"
                        />
                        {pr.author.name || pr.author.login}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-xs text-slate-400 font-medium">Branches</div>
                      <div className="text-xs font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                        <span>{pr.sourceBranch}</span>
                        <span className="text-slate-400">→</span>
                        <span>{pr.targetBranch}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-xs text-slate-400 font-medium">Created At</div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {pr.createdAtGithub ? new Date(pr.createdAtGithub).toLocaleString() : 'N/A'}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-xs text-slate-400 font-medium">Review Status</div>
                      <div className="text-sm font-medium">{renderReviewStatusBadge()}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {isReviewsLoading ? (
                    <div className="py-8 text-center text-slate-400">Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">No reviews submitted yet.</div>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={rev.user.avatar_url}
                              alt={rev.user.login}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {rev.user.name || rev.user.login}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              rev.state === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : rev.state === 'CHANGES_REQUESTED'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {rev.state}
                          </span>
                        </div>
                        {rev.body && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                            {rev.body}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Commits Tab */}
              {activeTab === 'commits' && (
                <div className="space-y-3">
                  {isCommitsLoading ? (
                    <div className="py-8 text-center text-slate-400">Loading commits...</div>
                  ) : commits.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">No commits in this PR.</div>
                  ) : (
                    commits.map((c) => (
                      <div
                        key={c.sha}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {c.message}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span>{c.author.name}</span>
                            <span>•</span>
                            <span>{new Date(c.committedAt || c.author.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <code className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold flex-shrink-0">
                          {c.shortSha}
                        </code>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Files Tab */}
              {activeTab === 'files' && (
                <div className="space-y-4">
                  {isFilesLoading ? (
                    <div className="py-8 text-center text-slate-400">Loading file changes...</div>
                  ) : files.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">No changed files available.</div>
                  ) : (
                    files.map((file) => {
                      const isExpanded = !!expandedFiles[file.filename];
                      return (
                        <div
                          key={file.filename}
                          className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900"
                        >
                          <button
                            onClick={() => toggleFilePatch(file.filename)}
                            className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              )}
                              <FileCode className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                              <span className="text-xs font-mono font-medium text-slate-900 dark:text-white truncate">
                                {file.filename}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs font-mono flex-shrink-0">
                              <span className="text-emerald-600 dark:text-emerald-400">+{file.additions}</span>
                              <span className="text-rose-600 dark:text-rose-400">-{file.deletions}</span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-sans text-[10px] font-bold">
                                {file.status}
                              </span>
                            </div>
                          </button>

                          {isExpanded && file.patch && (
                            <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border-t border-slate-800 leading-relaxed">
                              <pre className="whitespace-pre">{file.patch}</pre>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
