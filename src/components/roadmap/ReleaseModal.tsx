import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Rocket,
  Calendar as CalendarIcon,
  CheckCircle2,
  ListTodo,
  Flag,
  Copy,
  Archive,
  Trash2,
  FolderKanban,
  User,
  Sparkles,
} from 'lucide-react';
import { Release, ReleaseFormData, ReleaseStatus, ReleaseMilestone, ReleaseGoal } from '../../types/release';
import { useProjectStore } from '../../store/useProjectStore';
import { useTaskStore } from '../../store/useTaskStore';
import { MilestoneGoalManager } from './MilestoneGoalManager';

interface ReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  releaseToEdit?: Release | null;
  onSave: (data: ReleaseFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onDuplicate?: (id: string) => Promise<void>;
  onArchive?: (id: string, isArchived: boolean) => Promise<void>;
}

export const ReleaseModal: React.FC<ReleaseModalProps> = ({
  isOpen,
  onClose,
  releaseToEdit,
  onSave,
  onDelete,
  onDuplicate,
  onArchive,
}) => {
  const { projects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();

  const [activeTab, setActiveTab] = useState<'info' | 'tasks' | 'milestones'>('info');

  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<ReleaseStatus>('Planning');
  const [releaseDate, setReleaseDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const [milestones, setMilestones] = useState<ReleaseMilestone[]>([]);
  const [goals, setGoals] = useState<ReleaseGoal[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
      if (releaseToEdit) {
        setName(releaseToEdit.name || '');
        setVersion(releaseToEdit.version || '');
        setDescription(releaseToEdit.description || '');
        const pId =
          typeof releaseToEdit.project === 'object'
            ? releaseToEdit.project?.id
            : releaseToEdit.project;
        setProjectId(pId || '');
        setStatus(releaseToEdit.status || 'Planning');
        setReleaseDate(
          releaseToEdit.releaseDate
            ? releaseToEdit.releaseDate.split('T')[0]
            : ''
        );
        setStartDate(
          releaseToEdit.startDate ? releaseToEdit.startDate.split('T')[0] : ''
        );
        setEndDate(
          releaseToEdit.endDate ? releaseToEdit.endDate.split('T')[0] : ''
        );
        setColor(releaseToEdit.color || '#6366f1');
        setMilestones(releaseToEdit.milestones || []);
        setGoals(releaseToEdit.goals || []);
        setSelectedTaskIds(
          (releaseToEdit.tasks || []).map((t: any) =>
            typeof t === 'object' ? t.id || t._id : t
          )
        );
      } else {
        setName('');
        setVersion('');
        setDescription('');
        setProjectId(projects[0]?.id || '');
        setStatus('Planning');
        setReleaseDate('');
        setStartDate('');
        setEndDate('');
        setColor('#6366f1');
        setMilestones([]);
        setGoals([]);
        setSelectedTaskIds([]);
      }
    }
  }, [isOpen, releaseToEdit]);

  if (!isOpen) return null;

  const handleToggleTaskSelect = (taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId));
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !version.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        version: version.trim(),
        description: description.trim(),
        projectId: projectId || undefined,
        status,
        releaseDate: releaseDate || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        color,
        milestones,
        goals,
        taskIds: selectedTaskIds,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full p-6 space-y-6 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {releaseToEdit ? 'Edit Release' : 'Create Release / Version'}
              </h2>
              <p className="text-xs text-slate-500">
                Define delivery timelines, release scope, milestones, and goals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'info'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Rocket className="w-4 h-4" />
            Release Metadata
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'tasks'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Task & Epic Scope ({selectedTaskIds.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('milestones')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'milestones'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Flag className="w-4 h-4" />
            Milestones & Goals ({milestones.length})
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* TAB 1: Metadata */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Release Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. v2.0 Platform Release"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Version */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Version Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2.0.0-rc1"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description / Release Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Summary of feature scope and release goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Project */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Project
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  >
                    <option value="">Global / All Projects</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ReleaseStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Development">In Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Ready">Ready</option>
                    <option value="Released">Released</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Theme Color
                  </label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-9 p-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Release Date
                  </label>
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Scope & Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Select tasks, epics, and stories to assign to this release build.
              </div>
              <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 p-2">
                {tasks.length === 0 ? (
                  <div className="text-2xs text-slate-400 text-center py-6">
                    No active tasks available in system.
                  </div>
                ) : (
                  tasks.map((t) => {
                    const isSelected = selectedTaskIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTaskSelect(t.id)}
                        className={`flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span className="font-mono text-2xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {t.taskKey || 'TASK'}
                          </span>
                          <span className="text-slate-900 dark:text-slate-100 line-clamp-1">
                            {t.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-2xs text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {t.type}
                          </span>
                          <span>{t.status}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Milestones & Goals */}
          {activeTab === 'milestones' && (
            <MilestoneGoalManager
              milestones={milestones}
              goals={goals}
              onChangeMilestones={setMilestones}
              onChangeGoals={setGoals}
            />
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            {releaseToEdit ? (
              <div className="flex items-center gap-2">
                {onDuplicate && (
                  <button
                    type="button"
                    onClick={() => {
                      onDuplicate(releaseToEdit.id);
                      onClose();
                    }}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" /> Duplicate
                  </button>
                )}
                {onArchive && (
                  <button
                    type="button"
                    onClick={() => {
                      onArchive(releaseToEdit.id, !releaseToEdit.isArchived);
                      onClose();
                    }}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Archive className="w-4 h-4" /> {releaseToEdit.isArchived ? 'Restore' : 'Archive'}
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(releaseToEdit.id);
                      onClose();
                    }}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                {isSubmitting
                  ? 'Saving...'
                  : releaseToEdit
                  ? 'Save Release Changes'
                  : 'Create Release'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
