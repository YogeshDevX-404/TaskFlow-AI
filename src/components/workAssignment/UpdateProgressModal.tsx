import React, { useState } from 'react';
import { WorkAssignment } from '../../types/workAssignment';
import { useWorkAssignmentStore } from '../../store/useWorkAssignmentStore';
import {
  X,
  TrendingUp,
  AlertTriangle,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean;
  assignment: WorkAssignment | null;
  onClose: () => void;
}

export const UpdateProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  assignment,
  onClose,
}) => {
  const { updateProgress, actionLoading, error } = useWorkAssignmentStore();

  const [percentage, setPercentage] = useState(assignment?.progress || 0);
  const [comment, setComment] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  if (!isOpen || !assignment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await updateProgress(
      assignment.id,
      percentage,
      comment.trim() || undefined,
      attachmentUrl.trim() || undefined,
      attachmentName.trim() || undefined
    );

    if (updated) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Update Work Progress
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Report milestone percentage for {assignment.assignmentId}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Progress Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Completion:</span>
              <span className="text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                {percentage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={percentage}
              onChange={(e) => setPercentage(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Started)</span>
              <span>50% (Halfway)</span>
              <span>100% (Ready for Review)</span>
            </div>
          </div>

          {/* Milestone Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Progress Note / Milestone Update (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Unit tests written, DB migration done, working on UI integration..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Optional Attachment */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Paperclip className="w-3 h-3 text-indigo-500" />
              <span>Proof Link / Screenshot URL (Optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Title"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                className="w-1/3 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
              <input
                type="url"
                placeholder="https://..."
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Updating...' : 'Save Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
