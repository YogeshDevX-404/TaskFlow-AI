import React, { useState } from 'react';
import { WorkAssignment } from '../../../types/workAssignment';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  GitPullRequest,
  GitCommit,
  ExternalLink,
  Clock,
  Sparkles,
  Search,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface ReviewQueueViewProps {
  queue: WorkAssignment[];
  onOpenReviewModal: (assignment: WorkAssignment) => void;
  onSelectAssignment: (assignmentId: string) => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  queue,
  onOpenReviewModal,
  onSelectAssignment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQueue = queue.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignedTo?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search review deliverables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />
            <span>{filteredQueue.length} Deliverables Awaiting Review</span>
          </span>
        </div>
      </div>

      {/* Review Queue Items */}
      {filteredQueue.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Review Queue is All Clear!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            All submitted work assignments have been reviewed, approved, or returned for revisions. New developer submissions will appear here automatically in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQueue.map((item) => {
            const latestSubmission = item.submissions?.[item.submissions.length - 1];
            const versionNumber = latestSubmission?.version || item.submissions?.length || 1;
            const completedCriteriaCount = (item.acceptanceCriteria || []).filter(
              (c) => c.status === 'Completed'
            ).length;
            const totalCriteriaCount = item.acceptanceCriteria?.length || 0;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-purple-200 dark:hover:border-purple-900/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {item.assignmentId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                      Version v{versionNumber}
                    </span>
                    {item.project && (
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        • {item.project.name}
                      </span>
                    )}
                    {latestSubmission?.submittedAt && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(latestSubmission.submittedAt).toLocaleDateString()} at{' '}
                        {new Date(latestSubmission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Title & Submitter */}
                  <div>
                    <h4
                      onClick={() => onSelectAssignment(item.id)}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors"
                    >
                      {item.title}
                    </h4>

                    {/* Developer Info */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">Submitted by:</span>
                      <div className="flex items-center gap-1.5">
                        {item.assignedTo?.avatar ? (
                          <img
                            src={item.assignedTo.avatar}
                            alt={item.assignedTo.name}
                            className="w-5 h-5 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {item.assignedTo?.name?.charAt(0) || 'D'}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {item.assignedTo?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes & PR Link */}
                  {latestSubmission?.completionNote && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 italic">
                      "{latestSubmission.completionNote}"
                    </p>
                  )}

                  {/* Badges / Deliverable Evidence Summary */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    {totalCriteriaCount > 0 && (
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Criteria: {completedCriteriaCount}/{totalCriteriaCount} completed</span>
                      </span>
                    )}

                    {latestSubmission?.githubPrUrl && (
                      <a
                        href={latestSubmission.githubPrUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <GitPullRequest className="w-3.5 h-3.5" />
                        <span>Pull Request</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {latestSubmission?.githubCommitSha && (
                      <span className="flex items-center gap-1 text-slate-500 font-mono">
                        <GitCommit className="w-3.5 h-3.5" />
                        <span>{latestSubmission.githubCommitSha.substring(0, 7)}</span>
                      </span>
                    )}

                    {item.proofOfWork && item.proofOfWork.length > 0 && (
                      <span className="text-slate-500">
                        {item.proofOfWork.length} proof asset{item.proofOfWork.length !== 1 ? 's' : ''} attached
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => onOpenReviewModal(item)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Review Submission</span>
                  </button>

                  <button
                    onClick={() => onSelectAssignment(item.id)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Inspect Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
