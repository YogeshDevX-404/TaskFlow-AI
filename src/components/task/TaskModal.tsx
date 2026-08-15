import React, { useState, useEffect } from 'react';
import {
  Task,
  TaskFormData,
  TaskStatus,
  TaskPriority,
  TaskType,
} from '../../types/task';
import { TaskTypeBadge, TaskStatusBadge, TaskPriorityBadge } from './TaskBadges';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Tag,
  User as UserIcon,
  Briefcase,
  Layers,
  FileText,
  Plus,
} from 'lucide-react';

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: Task | null;
  projects?: { id: string; name: string; projectKey?: string }[];
  members?: { id: string; name: string; email?: string; avatar?: string }[];
  isSubmitting?: boolean;
}

const ALL_STATUSES: TaskStatus[] = [
  'Backlog',
  'Todo',
  'In Progress',
  'In Review',
  'Testing',
  'Done',
  'Blocked',
  'Cancelled',
];

const ALL_PRIORITIES: TaskPriority[] = [
  'Lowest',
  'Low',
  'Medium',
  'High',
  'Highest',
  'Urgent',
];

const ALL_TYPES: TaskType[] = [
  'Task',
  'Bug',
  'Story',
  'Epic',
  'Feature',
  'Improvement',
  'Research',
  'Spike',
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  projects = [],
  members = [],
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    type: 'Task',
    projectId: projects[0]?.id || 'proj-1',
    assigneeId: '',
    reporterId: members[0]?.id || '',
    labels: [],
    startDate: '',
    dueDate: '',
    estimatedHours: 0,
    spentHours: 0,
    storyPoints: 0,
  });

  const [labelInput, setLabelInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      const getMemberId = (m?: any) => {
        if (!m) return '';
        if (typeof m === 'object') return m.id || '';
        return String(m);
      };

      const getProjectId = (p?: any) => {
        if (!p) return projects[0]?.id || 'proj-1';
        if (typeof p === 'object') return p.id || '';
        return String(p);
      };

      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'Todo',
        priority: initialData.priority || 'Medium',
        type: initialData.type || 'Task',
        projectId: getProjectId(initialData.project) || initialData.projectId || projects[0]?.id || 'proj-1',
        assigneeId: getMemberId(initialData.assignee),
        reporterId: getMemberId(initialData.reporter),
        labels: initialData.labels || [],
        startDate: initialData.startDate ? initialData.startDate.substring(0, 10) : '',
        dueDate: initialData.dueDate ? initialData.dueDate.substring(0, 10) : '',
        estimatedHours: initialData.estimatedHours || 0,
        spentHours: initialData.spentHours || 0,
        storyPoints: initialData.storyPoints || 0,
      });
      setLabelInput('');
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        type: 'Task',
        projectId: projects[0]?.id || 'proj-1',
        assigneeId: '',
        reporterId: members[0]?.id || '',
        labels: [],
        startDate: '',
        dueDate: '',
        estimatedHours: 0,
        spentHours: 0,
        storyPoints: 0,
      });
      setLabelInput('');
    }
    setErrors({});
  }, [initialData, isOpen, projects, members]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (formData.startDate && formData.dueDate) {
      if (new Date(formData.startDate) > new Date(formData.dueDate)) {
        newErrors.dueDate = 'Due date cannot be earlier than start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save task' });
    }
  };

  const addLabel = () => {
    const trimmed = labelInput.trim().toLowerCase();
    if (trimmed && !formData.labels?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        labels: [...(prev.labels || []), trimmed],
      }));
      setLabelInput('');
    }
  };

  const removeLabel = (lbl: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: (prev.labels || []).filter((l) => l !== lbl),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {initialData ? `Edit Task (${initialData.taskKey})` : 'Create New Task'}
              </h2>
              <p className="text-xs text-slate-500">
                {initialData
                  ? 'Update task details and assignments'
                  : 'Add a new issue or feature to your project track'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement OAuth PKCE flow for mobile app authorization"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border ${
                errors.title
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'
              } text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition text-sm font-semibold`}
            />
            {errors.title && (
              <p className="mt-1 text-rose-500 text-[11px]">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide context, acceptance criteria, reproducible steps or technical details..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-xs font-normal"
            />
          </div>

          {/* Type, Status, Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Type */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Task Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as TaskType })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {ALL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as TaskStatus })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as TaskPriority })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {ALL_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project & Assignee Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Project
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.projectKey ? `[${proj.projectKey}] ` : ''}
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assignee
              </label>
              <select
                value={formData.assigneeId || ''}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {errors.dueDate && (
                <p className="mt-1 text-rose-500 text-[10px]">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.estimatedHours || 0}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedHours: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Story Points
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.storyPoints || 0}
                onChange={(e) =>
                  setFormData({ ...formData, storyPoints: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Labels Chip Creator */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Labels & Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLabel();
                  }
                }}
                placeholder="Type label and press Enter (e.g. backend)"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addLabel}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {formData.labels && formData.labels.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {formData.labels.map((lbl) => (
                  <span
                    key={lbl}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold text-xs"
                  >
                    <span>#{lbl}</span>
                    <button
                      type="button"
                      onClick={() => removeLabel(lbl)}
                      className="hover:text-rose-500 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
