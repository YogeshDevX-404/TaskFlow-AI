import React, { useState, useEffect } from 'react';
import { Sprint, SprintFormData, SprintStatus } from '../../types/sprint';
import { X, Calendar, Target, Flag, Layers, Hash } from 'lucide-react';

interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SprintFormData) => Promise<void>;
  editingSprint?: Sprint | null;
  projects: Array<{ id: string; name: string; projectKey?: string }>;
  defaultProjectId?: string;
}

export const SprintModal: React.FC<SprintModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingSprint,
  projects,
  defaultProjectId,
}) => {
  const [formData, setFormData] = useState<SprintFormData>({
    name: '',
    goal: '',
    description: '',
    status: 'Planning',
    startDate: '',
    endDate: '',
    projectId: defaultProjectId || projects[0]?.id || '',
    capacity: 40,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingSprint) {
      const projId = typeof editingSprint.project === 'object' ? editingSprint.project.id : editingSprint.project;
      setFormData({
        name: editingSprint.name || '',
        goal: editingSprint.goal || '',
        description: editingSprint.description || '',
        status: editingSprint.status || 'Planning',
        startDate: editingSprint.startDate ? editingSprint.startDate.split('T')[0] : '',
        endDate: editingSprint.endDate ? editingSprint.endDate.split('T')[0] : '',
        projectId: projId || defaultProjectId || projects[0]?.id || '',
        capacity: editingSprint.capacity || 40,
      });
    } else {
      setFormData({
        name: '',
        goal: '',
        description: '',
        status: 'Planning',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        projectId: defaultProjectId || projects[0]?.id || '',
        capacity: 40,
      });
    }
  }, [editingSprint, isOpen, defaultProjectId, projects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Sprint name is required');
      return;
    }
    if (!formData.projectId) {
      setError('Please select a project');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save sprint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingSprint ? 'Edit Sprint' : 'Create New Sprint'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define sprint goals, duration, and story point capacity.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Project Selection */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Project <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.projectKey ? `(${p.projectKey})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Sprint Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sprint Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sprint 24 - Core Features"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Sprint Goal */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sprint Goal
            </label>
            <input
              type="text"
              placeholder="e.g. Complete User Profile & RBAC module"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Dates & Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sprint Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as SprintStatus })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Story Point Capacity
              </label>
              <input
                type="number"
                min="0"
                placeholder="40"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sprint Description & Notes
            </label>
            <textarea
              rows={3}
              placeholder="Additional sprint instructions, constraints, or guidelines..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : editingSprint ? 'Update Sprint' : 'Create Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
