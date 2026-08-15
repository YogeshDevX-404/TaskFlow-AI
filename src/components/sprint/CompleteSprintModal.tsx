import React, { useState } from 'react';
import { Sprint } from '../../types/sprint';
import { CheckCircle, AlertCircle, ArrowRight, X } from 'lucide-react';

interface CompleteSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (moveUnfinishedToSprintId?: string) => Promise<void>;
  sprint: Sprint | null;
  futureSprints: Sprint[];
  completedCount: number;
  incompleteCount: number;
  achievedVelocity: number;
}

export const CompleteSprintModal: React.FC<CompleteSprintModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sprint,
  futureSprints,
  completedCount,
  incompleteCount,
  achievedVelocity,
}) => {
  const [targetSprintId, setTargetSprintId] = useState<string>('backlog');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !sprint) return null;

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(targetSprintId === 'backlog' ? undefined : targetSprintId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Complete {sprint.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">
              {completedCount}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Tasks Done</span>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 p-3 rounded-xl">
            <span className="text-lg font-black text-purple-600 dark:text-purple-400 block">
              {achievedVelocity}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Velocity Pts</span>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 rounded-xl">
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 block">
              {incompleteCount}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Incomplete</span>
          </div>
        </div>

        {/* Incomplete tasks destination dropdown */}
        {incompleteCount > 0 && (
          <div className="space-y-2 text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Where should {incompleteCount} incomplete task(s) be moved?</span>
            </label>
            <select
              value={targetSprintId}
              onChange={(e) => setTargetSprintId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="backlog">Unassigned Product Backlog</option>
              {futureSprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-500/20 flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? 'Completing...' : 'Complete Sprint'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
