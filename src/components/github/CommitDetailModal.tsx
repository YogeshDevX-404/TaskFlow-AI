import React, { useState } from 'react';
import {
  X,
  GitCommit,
  User,
  Calendar,
  ExternalLink,
  FileCode,
  Plus,
  Minus,
  Tag,
  FileText,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { useGitHubCommitDetails } from '../../hooks/useGitHubBranchCommit';
import { IGitHubCommitFileData } from '../../services/api/githubIntegrationService';

interface CommitDetailModalProps {
  connectionId: string;
  sha: string;
  onClose: () => void;
}

export const CommitDetailModal: React.FC<CommitDetailModalProps> = ({
  connectionId,
  sha,
  onClose,
}) => {
  const { data: commit, isLoading, isError, error } = useGitHubCommitDetails(connectionId, sha);
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});
  const [copiedSha, setCopiedSha] = useState(false);

  const toggleFile = (filename: string) => {
    setExpandedFiles((prev) => ({
      ...prev,
      [filename]: !prev[filename],
    }));
  };

  const handleCopySha = () => {
    if (commit?.sha) {
      navigator.clipboard.writeText(commit.sha);
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/90">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <GitCommit className="w-4 h-4" />
              </span>
              <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                {commit?.shortSha || sha.substring(0, 7)}
              </span>
              <button
                onClick={handleCopySha}
                className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy Full SHA"
              >
                {copiedSha ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <h3 className="text-base font-bold text-white break-words">
              {commit ? commit.message.split('\n')[0] : 'Loading commit details...'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading && (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Fetching commit information & file diffs...</p>
            </div>
          )}

          {isError && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-2">
              <p className="text-sm font-bold text-rose-400">Error Loading Commit</p>
              <p className="text-xs text-slate-400">{error?.message}</p>
            </div>
          )}

          {commit && (
            <>
              {/* Message Details */}
              {commit.message.includes('\n') && (
                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-xs text-slate-300 whitespace-pre-wrap font-mono">
                  {commit.message.substring(commit.message.indexOf('\n')).trim()}
                </div>
              )}

              {/* Author & Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Author Card */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Author
                  </span>
                  <div className="flex items-center gap-2.5">
                    {commit.author.avatar_url ? (
                      <img
                        src={commit.author.avatar_url}
                        alt={commit.author.name}
                        className="w-7 h-7 rounded-full border border-slate-700"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{commit.author.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{commit.author.email}</p>
                    </div>
                  </div>
                </div>

                {/* Date & Branch Card */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Committed At
                  </span>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>
                      {new Date(commit.committedAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>

                {/* Diff Stats Card */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Changes Overview
                  </span>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <Plus className="w-3.5 h-3.5" />
                      {commit.stats?.additions || 0}
                    </span>
                    <span className="text-rose-400 flex items-center gap-0.5">
                      <Minus className="w-3.5 h-3.5" />
                      {commit.stats?.deletions || 0}
                    </span>
                    <span className="text-slate-400 font-normal">
                      ({commit.files?.length || 0} files)
                    </span>
                  </div>
                </div>
              </div>

              {/* Related References Banner */}
              {(commit.relatedTask || commit.relatedIssue) && (
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-wrap items-center gap-4">
                  <span className="text-xs font-bold text-indigo-300">References Detected:</span>
                  {commit.relatedTask && (
                    <div className="flex items-center gap-2 text-xs text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                      <Tag className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-bold text-purple-300">{commit.relatedTask.taskKey}:</span>
                      <span className="text-slate-300 truncate max-w-xs">{commit.relatedTask.title}</span>
                    </div>
                  )}

                  {commit.relatedIssue && (
                    <a
                      href={commit.relatedIssue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-bold text-blue-300">#{commit.relatedIssue.issueNumber}:</span>
                      <span className="text-slate-300 truncate max-w-xs">{commit.relatedIssue.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  )}
                </div>
              )}

              {/* File Changes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  File Changes ({commit.files?.length || 0})
                </h4>

                <div className="space-y-2">
                  {commit.files?.map((file: IGitHubCommitFileData) => {
                    const isExpanded = expandedFiles[file.filename] ?? true;

                    let statusBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    if (file.status === 'added') statusBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    if (file.status === 'deleted') statusBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                    return (
                      <div
                        key={file.filename}
                        className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden"
                      >
                        {/* File Header Bar */}
                        <div
                          onClick={() => toggleFile(file.filename)}
                          className="p-3 bg-slate-900/60 hover:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                            <span className="font-mono text-xs font-bold text-slate-200 truncate">
                              {file.filename}
                            </span>
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${statusBadgeClass}`}
                            >
                              {file.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono">
                            <span className="text-emerald-400">+{file.additions}</span>
                            <span className="text-rose-400">-{file.deletions}</span>
                          </div>
                        </div>

                        {/* File Diff Content */}
                        {isExpanded && file.patch && (
                          <div className="p-3 bg-slate-950 font-mono text-xs overflow-x-auto leading-relaxed border-t border-slate-800/60">
                            {file.patch.split('\n').map((line, idx) => {
                              let bg = 'text-slate-400';
                              if (line.startsWith('+')) bg = 'bg-emerald-500/10 text-emerald-400 font-medium px-1 rounded-sm';
                              else if (line.startsWith('-')) bg = 'bg-rose-500/10 text-rose-400 font-medium px-1 rounded-sm';
                              else if (line.startsWith('@@')) bg = 'text-cyan-400 font-bold my-1';

                              return (
                                <div key={idx} className={`whitespace-pre ${bg}`}>
                                  {line}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          {commit?.html_url && (
            <a
              href={commit.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open on GitHub
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
