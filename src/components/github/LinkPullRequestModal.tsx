import React, { useState, useEffect } from 'react';
import { IGitHubRepoConnection } from '../../services/api/githubIntegrationService';
import { useLinkTaskPullRequest, useGitHubPullRequests } from '../../hooks/useGitHubPullRequests';
import { GitPullRequest, Search, AlertCircle, Loader2, X, Link as LinkIcon } from 'lucide-react';

interface LinkPullRequestModalProps {
  taskId: string;
  connections: IGitHubRepoConnection[];
  isOpen: boolean;
  onClose: () => void;
  onLinked?: () => void;
}

export const LinkPullRequestModal: React.FC<LinkPullRequestModalProps> = ({
  taskId,
  connections,
  isOpen,
  onClose,
  onLinked,
}) => {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [selectedPrNumber, setSelectedPrNumber] = useState<number | null>(null);
  const [customPrNumber, setCustomPrNumber] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const linkMutation = useLinkTaskPullRequest();

  useEffect(() => {
    if (connections.length > 0 && !selectedConnectionId) {
      setSelectedConnectionId(connections[0].id);
    }
  }, [connections, selectedConnectionId]);

  const { data: prsData, isLoading: isLoadingPrs } = useGitHubPullRequests(
    isOpen ? selectedConnectionId : null,
    { state: 'all', search: searchTerm.trim() || undefined, limit: 20 }
  );

  if (!isOpen) return null;

  const prs = prsData?.pullRequests || [];

  const handleLink = (prNum: number) => {
    if (!selectedConnectionId) {
      setFormError('Please select a repository connection.');
      return;
    }
    setFormError('');

    linkMutation.mutate(
      { taskId, connectionId: selectedConnectionId, prNumber: prNum },
      {
        onSuccess: () => {
          if (onLinked) onLinked();
          onClose();
        },
        onError: (err: any) => {
          setFormError(err.message || 'Failed to link pull request.');
        },
      }
    );
  };

  const handleCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(customPrNumber.trim(), 10);
    if (isNaN(num) || num <= 0) {
      setFormError('Please enter a valid positive Pull Request number.');
      return;
    }
    handleLink(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Link Existing Pull Request
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Link an existing GitHub Pull Request to this task
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Connection Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Repository
            </label>
            <select
              value={selectedConnectionId}
              onChange={(e) => setSelectedConnectionId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName || `${c.githubOwner}/${c.repositoryName}`}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Manual Entry */}
          <form onSubmit={handleCustomLink} className="flex gap-2 items-end pt-1">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                PR Number
              </label>
              <input
                type="number"
                placeholder="e.g. 101"
                value={customPrNumber}
                onChange={(e) => setCustomPrNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={linkMutation.isPending || !customPrNumber.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {linkMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Link PR
            </button>
          </form>

          <div className="relative py-2 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Or pick from list
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search pull requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Pull Request List */}
          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {isLoadingPrs ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading pull requests...</div>
            ) : prs.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No pull requests found.</div>
            ) : (
              prs.map((p) => (
                <div
                  key={p.githubPullRequestNumber}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        #{p.githubPullRequestNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {p.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>by {p.author.login}</span>
                      <span>•</span>
                      <span className="capitalize">{p.state}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLink(p.githubPullRequestNumber)}
                    disabled={linkMutation.isPending}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors flex-shrink-0"
                  >
                    Link
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
