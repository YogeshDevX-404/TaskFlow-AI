import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Tag, Plus, Edit, Trash2, Archive, CheckCircle2, RotateCcw } from 'lucide-react';
import { useVersions } from '../../hooks/useVersions';
import { useProjectStore } from '../../store/useProjectStore';

interface VersionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionManagementModal: React.FC<VersionManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { projects } = useProjectStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const { versions, createVersion, updateVersion, deleteVersion, archiveVersion, fetchVersions } =
    useVersions(selectedProjectId, isOpen);

  const [versionInput, setVersionInput] = useState('');
  const [releaseNameInput, setReleaseNameInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [releaseDateInput, setReleaseDateInput] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchVersions(selectedProjectId);
    }
  }, [isOpen, selectedProjectId]);

  if (!isOpen) return null;

  const handleCreateOrUpdate = async () => {
    if (!versionInput.trim() || !releaseNameInput.trim()) return;

    if (editingId) {
      await updateVersion(editingId, {
        version: versionInput,
        releaseName: releaseNameInput,
        description: descriptionInput,
        releaseDate: releaseDateInput,
      });
      setEditingId(null);
    } else {
      await createVersion({
        version: versionInput,
        releaseName: releaseNameInput,
        description: descriptionInput,
        releaseDate: releaseDateInput,
        projectId: selectedProjectId || undefined,
      });
    }

    setVersionInput('');
    setReleaseNameInput('');
    setDescriptionInput('');
    setReleaseDateInput('');
  };

  const handleStartEdit = (v: any) => {
    setEditingId(v.id);
    setVersionInput(v.version);
    setReleaseNameInput(v.releaseName);
    setDescriptionInput(v.description || '');
    setReleaseDateInput(v.releaseDate || '');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full p-6 space-y-5 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Version Management
              </h2>
              <p className="text-xs text-slate-500">
                Manage release candidates, build tags, and version lifecycle.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Selector */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Filter Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Create / Edit Form */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            {editingId ? 'Edit Version' : 'Create New Version'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Version (e.g. 1.2.0 or 2026.Q3)"
              value={versionInput}
              onChange={(e) => setVersionInput(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <input
              type="text"
              placeholder="Release Name (e.g. Summer Feature Drop)"
              value={releaseNameInput}
              onChange={(e) => setReleaseNameInput(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="date"
              value={releaseDateInput}
              onChange={(e) => setReleaseDateInput(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              onClick={handleCreateOrUpdate}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              {editingId ? 'Update Version' : 'Add Version'}
            </button>
          </div>
        </div>

        {/* Versions Table / List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 font-mono font-bold">
                  v{v.version}
                </span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{v.releaseName}</div>
                  <div className="text-2xs text-slate-400">
                    Status: {v.status} • {v.completedTasks}/{v.totalTasks} tasks ({v.progress}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartEdit(v)}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => archiveVersion(v.id, !v.isArchived)}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  title={v.isArchived ? 'Restore' : 'Archive'}
                >
                  {v.isArchived ? <RotateCcw className="w-3.5 h-3.5 text-emerald-500" /> : <Archive className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => deleteVersion(v.id)}
                  className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
