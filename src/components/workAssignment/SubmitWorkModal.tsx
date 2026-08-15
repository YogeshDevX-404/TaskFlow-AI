import React, { useState } from 'react';
import { WorkAssignment } from '../../types/workAssignment';
import { ProofCategory } from '../../config/assignmentConfig';
import { useWorkAssignmentStore } from '../../store/useWorkAssignmentStore';
import {
  X,
  Send,
  GitPullRequest,
  FileCheck2,
  AlertTriangle,
  Code2,
  Paperclip,
  Trash2,
  CheckCircle2,
  Check,
  Plus,
  Shield,
} from 'lucide-react';

interface SubmitModalProps {
  isOpen: boolean;
  assignment: WorkAssignment | null;
  onClose: () => void;
}

export const SubmitWorkModal: React.FC<SubmitModalProps> = ({
  isOpen,
  assignment,
  onClose,
}) => {
  const { submitWork, actionLoading, error } = useWorkAssignmentStore();

  const [completionNote, setCompletionNote] = useState('');
  const [githubPrUrl, setGithubPrUrl] = useState(
    assignment?.githubPullRequest?.url || ''
  );
  const [githubCommitSha, setGithubCommitSha] = useState('');

  // Proof items
  const [proofTitle, setProofTitle] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofCategory, setProofCategory] = useState<ProofCategory>('Final Result');
  const [proofDescription, setProofDescription] = useState('');
  const [proofs, setProofs] = useState<any[]>([]);

  if (!isOpen || !assignment) return null;

  const currentVersion = (assignment.submissions?.length || 0) + 1;
  const criteriaList = assignment.acceptanceCriteria || [];
  const completedCriteriaCount = criteriaList.filter((c) => c.status === 'Completed').length;

  const handleAddProof = () => {
    if (!proofTitle.trim() || !proofUrl.trim()) return;
    setProofs([
      ...proofs,
      {
        id: `proof_${Date.now()}`,
        title: proofTitle.trim(),
        fileName: proofTitle.trim(),
        originalName: proofTitle.trim(),
        fileUrl: proofUrl.trim(),
        category: proofCategory,
        description: proofDescription.trim() || undefined,
        fileType: 'proof',
        mimeType: 'text/uri-list',
        fileSize: 1024,
        uploadedBy: assignment.assignedTo?._id || 'user',
        uploadedAt: new Date().toISOString(),
      },
    ]);
    setProofTitle('');
    setProofUrl('');
    setProofDescription('');
  };

  const handleRemoveProof = (index: number) => {
    setProofs(proofs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionNote.trim()) return;

    const updated = await submitWork(assignment.id, {
      completionNote: completionNote.trim(),
      githubPrUrl: githubPrUrl.trim() || undefined,
      githubCommitSha: githubCommitSha.trim() || undefined,
      proofAttachments: proofs.length > 0 ? proofs : undefined,
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
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Submit Work for Review
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Version {currentVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submit {assignment.assignmentId} to your team lead or manager for deliverable verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
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

          {/* Criteria Checklist Snapshot Preview */}
          {criteriaList.length > 0 && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  Acceptance Criteria Check ({completedCriteriaCount}/{criteriaList.length} completed)
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    completedCriteriaCount === criteriaList.length
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {completedCriteriaCount === criteriaList.length
                    ? 'All Requirements Met'
                    : 'Partial Check'}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                {criteriaList.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    {c.status === 'Completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                    )}
                    <span
                      className={`truncate ${
                        c.status === 'Completed'
                          ? 'text-slate-800 dark:text-slate-200 font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {c.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Completion Summary & Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe what has been delivered, how requirements were fulfilled, and any verification instructions..."
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* GitHub PR & Commit Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <GitPullRequest className="w-3.5 h-3.5 text-purple-500" />
                <span>GitHub Pull Request URL</span>
              </label>
              <input
                type="url"
                placeholder="https://github.com/org/repo/pull/42"
                value={githubPrUrl}
                onChange={(e) => setGithubPrUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Commit SHA (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 7f9a2b1"
                value={githubCommitSha}
                onChange={(e) => setGithubCommitSha(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Proof of Work Artifacts */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Attach Deliverable Proof / Screenshot URL</span>
            </label>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Proof Title (e.g. Loom Demo)"
                  value={proofTitle}
                  onChange={(e) => setProofTitle(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
                <select
                  value={proofCategory}
                  onChange={(e) => setProofCategory(e.target.value as ProofCategory)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="Final Result">Final Result</option>
                  <option value="Testing">Testing</option>
                  <option value="After">After</option>
                  <option value="Progress Evidence">Progress Evidence</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://... image or demo link"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddProof}
                  disabled={!proofTitle.trim() || !proofUrl.trim()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach</span>
                </button>
              </div>
            </div>

            {proofs.length > 0 && (
              <div className="space-y-1 mt-2">
                {proofs.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {p.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                        {p.category}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProof(idx)}
                      className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              disabled={actionLoading || !completionNote.trim()}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {actionLoading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Version {currentVersion}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
