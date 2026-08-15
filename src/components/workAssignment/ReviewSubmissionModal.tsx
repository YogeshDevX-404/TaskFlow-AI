import React, { useState } from 'react';
import { WorkAssignment } from '../../types/workAssignment';
import { useWorkAssignmentStore } from '../../store/useWorkAssignmentStore';
import {
  X,
  CheckCircle2,
  RotateCcw,
  XCircle,
  GitPullRequest,
  Code2,
  Paperclip,
  AlertTriangle,
  ExternalLink,
  Shield,
  Check,
} from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  assignment: WorkAssignment | null;
  onClose: () => void;
}

export const ReviewSubmissionModal: React.FC<ReviewModalProps> = ({
  isOpen,
  assignment,
  onClose,
}) => {
  const { reviewSubmission, actionLoading, error } = useWorkAssignmentStore();

  const [decision, setDecision] = useState<'approve' | 'request_changes' | 'reject'>('approve');
  const [reason, setReason] = useState('');
  const [completionNote, setCompletionNote] = useState('');

  if (!isOpen || !assignment) return null;

  // Retrieve the latest submission (either from versioned submissions array or legacy submission field)
  const submissionsList = assignment.submissions || [];
  const latestSubmission =
    submissionsList.length > 0
      ? submissionsList[submissionsList.length - 1]
      : assignment.submission;

  const currentVersion = latestSubmission?.version || submissionsList.length || 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((decision === 'request_changes' || decision === 'reject') && !reason.trim()) {
      return;
    }

    const updated = await reviewSubmission(assignment.id, {
      decision,
      reason: reason.trim() || undefined,
      completionNote: completionNote.trim() || undefined,
    });

    if (updated) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Review Deliverable Package
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Version {currentVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluate developer deliverables, criteria fulfillment, and code quality for {assignment.assignmentId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submission Preview Card */}
          {latestSubmission && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Submitted Deliverable Summary</span>
                {latestSubmission.submittedAt && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    {new Date(latestSubmission.submittedAt).toLocaleString()}
                  </span>
                )}
              </div>

              {latestSubmission.completionNote && (
                <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed whitespace-pre-wrap">
                  <p className="font-semibold text-[10px] uppercase text-slate-400 mb-1">
                    Developer Notes:
                  </p>
                  <p>{latestSubmission.completionNote}</p>
                </div>
              )}

              {/* GitHub PR & Commit Link */}
              <div className="flex flex-wrap gap-2 text-xs">
                {latestSubmission.githubPrUrl && (
                  <a
                    href={latestSubmission.githubPrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold hover:underline"
                  >
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>View Pull Request</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}

                {latestSubmission.githubCommitSha && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                    <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Commit: {latestSubmission.githubCommitSha}</span>
                  </span>
                )}
              </div>

              {/* Criteria Snapshot if present */}
              {latestSubmission.criteriaSnapshot && latestSubmission.criteriaSnapshot.length > 0 && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="font-bold text-[10px] uppercase text-slate-400 block">
                    Acceptance Criteria Verification Snapshot:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                    {latestSubmission.criteriaSnapshot.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        {c.status === 'Completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                        <span className="truncate">{c.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Decision Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Review Decision <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Approve */}
              <button
                type="button"
                onClick={() => setDecision('approve')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                  decision === 'approve'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Approve</span>
                </div>
                <span className="text-[10px] text-slate-400">Accept & complete work</span>
              </button>

              {/* Request Changes */}
              <button
                type="button"
                onClick={() => setDecision('request_changes')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                  decision === 'request_changes'
                    ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-900 dark:text-orange-200 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <RotateCcw className="w-4 h-4 text-orange-500" />
                  <span>Revisions</span>
                </div>
                <span className="text-[10px] text-slate-400">Request specific fixes</span>
              </button>

              {/* Reject */}
              <button
                type="button"
                onClick={() => setDecision('reject')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                  decision === 'reject'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Reject</span>
                </div>
                <span className="text-[10px] text-slate-400">Decline submission</span>
              </button>
            </div>
          </div>

          {/* Feedback & Comments based on decision */}
          {decision === 'approve' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Manager Completion Note (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Verified and approved. Great code quality and test coverage!"
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white resize-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Reason & Feedback Instructions <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder={
                  decision === 'request_changes'
                    ? 'Explain the exact changes or edge cases the developer must address before re-submitting...'
                    : 'Explain the reason this submission is being rejected...'
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 dark:text-white resize-none ${
                  decision === 'request_changes'
                    ? 'border-orange-200 dark:border-orange-800 focus:ring-orange-500'
                    : 'border-rose-200 dark:border-rose-800 focus:ring-rose-500'
                }`}
              />
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                actionLoading ||
                ((decision === 'request_changes' || decision === 'reject') && !reason.trim())
              }
              className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 ${
                decision === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : decision === 'request_changes'
                  ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              }`}
            >
              {actionLoading ? (
                <span>Submitting Decision...</span>
              ) : (
                <>
                  {decision === 'approve' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : decision === 'request_changes' ? (
                    <RotateCcw className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {decision === 'approve'
                      ? 'Approve & Mark Completed'
                      : decision === 'request_changes'
                      ? 'Send Back for Revisions'
                      : 'Reject Submission'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
