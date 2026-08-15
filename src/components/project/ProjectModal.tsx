import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Project, ProjectStatus, ProjectVisibility } from '../../types/project';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { X, Briefcase, Code, Layers, Target, Shield, Layout, Palette, Server, Zap, Globe, Image as ImageIcon } from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  projectKey: z.string().min(2, 'Key must be 2-10 characters').max(20, 'Key cannot exceed 20 characters').regex(/^[A-Za-z0-9_-]+$/, 'Key can only contain letters, numbers, hyphens, and underscores'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  workspaceId: z.string().min(1, 'Please select a workspace'),
  icon: z.string().optional(),
  coverImage: z.string().optional(),
  visibility: z.enum(['private', 'workspace', 'organization'] as const),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived'] as const),
  repositoryUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  initialData?: Project | null;
  isLoading?: boolean;
}

const ICON_OPTIONS = [
  { id: 'briefcase', label: 'Briefcase', icon: Briefcase },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'target', label: 'Target', icon: Target },
  { id: 'shield', label: 'Shield', icon: Shield },
  { id: 'layout', label: 'Layout', icon: Layout },
  { id: 'palette', label: 'Palette', icon: Palette },
  { id: 'server', label: 'Server', icon: Server },
  { id: 'zap', label: 'Zap', icon: Zap },
  { id: 'globe', label: 'Globe', icon: Globe },
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();

  useEffect(() => {
    if (workspaces.length === 0) {
      fetchWorkspaces();
    }
  }, []);

  const defaultWorkspaceId =
    initialData?.workspace
      ? typeof initialData.workspace === 'object'
        ? initialData.workspace.id
        : initialData.workspace
      : workspaces[0]?.id || 'ws-eng-001';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name || '',
      projectKey: initialData?.projectKey || '',
      description: initialData?.description || '',
      workspaceId: defaultWorkspaceId,
      icon: initialData?.icon || 'briefcase',
      coverImage: initialData?.coverImage || '',
      visibility: initialData?.visibility || 'workspace',
      status: initialData?.status || 'active',
      repositoryUrl: initialData?.repositoryUrl || '',
      websiteUrl: initialData?.websiteUrl || '',
      startDate: initialData?.startDate ? initialData.startDate.slice(0, 10) : '',
      endDate: initialData?.endDate ? initialData.endDate.slice(0, 10) : '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        projectKey: initialData.projectKey,
        description: initialData.description || '',
        workspaceId: typeof initialData.workspace === 'object' ? initialData.workspace.id : initialData.workspace,
        icon: initialData.icon || 'briefcase',
        coverImage: initialData.coverImage || '',
        visibility: initialData.visibility,
        status: initialData.status,
        repositoryUrl: initialData.repositoryUrl || '',
        websiteUrl: initialData.websiteUrl || '',
        startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : '',
        endDate: initialData.endDate ? initialData.endDate.slice(0, 10) : '',
      });
    } else {
      reset({
        name: '',
        projectKey: '',
        description: '',
        workspaceId: workspaces[0]?.id || 'ws-eng-001',
        icon: 'briefcase',
        coverImage: '',
        visibility: 'workspace',
        status: 'active',
        repositoryUrl: '',
        websiteUrl: '',
        startDate: '',
        endDate: '',
      });
    }
  }, [initialData, isOpen, reset, workspaces]);

  const nameValue = watch('name');
  const selectedIcon = watch('icon');
  const selectedCover = watch('coverImage');

  // Auto-generate project key from name if creating new project and key is empty or user typed
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('name', val);
    if (!initialData) {
      const generated = val
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .slice(0, 6);
      setValue('projectKey', generated);
    }
  };

  const handleFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialData ? 'Edit Project Details' : 'Create New Project'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {initialData
                ? 'Update settings, repository link, and workspace assignment'
                : 'Projects organize tasks, repos, and roadmaps inside workspaces'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Name & Project Key */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Core Platform Engineering"
                onChange={handleNameChange}
                value={nameValue}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Project Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. CORE"
                {...register('projectKey')}
                className="w-full px-3.5 py-2 text-sm font-mono font-bold uppercase bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-indigo-600 dark:text-indigo-400"
              />
              {errors.projectKey && <p className="text-xs text-red-500">{errors.projectKey.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of the project goals, architecture, or scope..."
              {...register('description')}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {/* Workspace & Visibility & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Workspace <span className="text-red-500">*</span>
              </label>
              <select
                {...register('workspaceId')}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
              {errors.workspaceId && <p className="text-xs text-red-500">{errors.workspaceId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Visibility
              </label>
              <select
                {...register('visibility')}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="workspace">Workspace Only</option>
                <option value="organization">Entire Organization</option>
                <option value="private">Private (Members Only)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Project Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = selectedIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setValue('icon', item.id)}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cover Image URL or Presets
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/photo-..."
              {...register('coverImage')}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
            {errors.coverImage && <p className="text-xs text-red-500">{errors.coverImage.message}</p>}

            <div className="grid grid-cols-4 gap-2 pt-1">
              {PRESET_COVERS.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setValue('coverImage', url)}
                  className={`h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedCover === url
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="Preset cover" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* URLs & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Repository URL
              </label>
              <input
                type="text"
                placeholder="https://github.com/org/repo"
                {...register('repositoryUrl')}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
              {errors.repositoryUrl && <p className="text-xs text-red-500">{errors.repositoryUrl.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Documentation / Website URL
              </label>
              <input
                type="text"
                placeholder="https://docs.acme.com"
                {...register('websiteUrl')}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
              {errors.websiteUrl && <p className="text-xs text-red-500">{errors.websiteUrl.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Start Date
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Completion Date
              </label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
