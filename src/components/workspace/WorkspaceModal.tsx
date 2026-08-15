import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Sparkles, Globe, Lock, Building } from 'lucide-react';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { WorkspaceIcon, WORKSPACE_ICON_MAP } from './WorkspaceIcon';
import { Workspace, WorkspaceVisibility } from '../../types/workspace';

const workspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Workspace name must be at least 2 characters')
    .max(100, 'Workspace name cannot exceed 100 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug cannot exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
  visibility: z.enum(['private', 'organization', 'public']),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

const COLOR_PRESETS = [
  '#4f46e5', // Indigo
  '#2563eb', // Blue
  '#0284c7', // Sky
  '#0d9488', // Teal
  '#16a34a', // Green
  '#ca8a04', // Yellow
  '#ea580c', // Orange
  '#e11d48', // Rose
  '#9333ea', // Purple
  '#475569', // Slate
];

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceToEdit?: Workspace | null;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  workspaceToEdit,
}) => {
  const { createWorkspace, updateWorkspace, isActionLoading, error, clearError } =
    useWorkspaces();

  const isEditing = !!workspaceToEdit;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: 'layout',
      color: '#4f46e5',
      visibility: 'organization',
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');
  const watchName = watch('name');

  // Sync form when workspaceToEdit or isOpen changes
  useEffect(() => {
    if (isOpen) {
      clearError();
      if (workspaceToEdit) {
        reset({
          name: workspaceToEdit.name,
          slug: workspaceToEdit.slug,
          description: workspaceToEdit.description || '',
          icon: workspaceToEdit.icon || 'layout',
          color: workspaceToEdit.color || '#4f46e5',
          visibility: workspaceToEdit.visibility || 'organization',
        });
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          icon: 'layout',
          color: '#4f46e5',
          visibility: 'organization',
        });
      }
    }
  }, [isOpen, workspaceToEdit, reset, clearError]);

  // Auto generate slug from name in creation mode
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('name', val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: WorkspaceFormData) => {
    if (isEditing && workspaceToEdit) {
      const success = await updateWorkspace(workspaceToEdit.id, data);
      if (success) {
        onClose();
      }
    } else {
      const result = await createWorkspace(data);
      if (result) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <WorkspaceIcon icon={selectedIcon} color={selectedColor} size={20} />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isEditing ? 'Edit Workspace' : 'Create New Workspace'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Update workspace configuration and visibility.'
                  : 'Workspaces organize your team projects and resources.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/50">
              {error}
            </div>
          )}

          {/* Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Workspace Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Engineering, Marketing"
                {...register('name')}
                onChange={handleNameChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Slug / URL Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. engineering"
                {...register('slug')}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.slug && (
                <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors.slug.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="What is this workspace used for?"
              {...register('description')}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-[11px] text-rose-500 font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Workspace Icon
            </label>
            <div className="grid grid-cols-7 gap-2">
              {Object.keys(WORKSPACE_ICON_MAP).map((iconKey) => {
                const isSelected = selectedIcon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setValue('icon', iconKey)}
                    className={`flex items-center justify-center p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <WorkspaceIcon icon={iconKey} color={selectedColor} size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_PRESETS.map((colorHex) => (
                <button
                  key={colorHex}
                  type="button"
                  onClick={() => setValue('color', colorHex)}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    selectedColor === colorHex ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: colorHex }}
                />
              ))}
            </div>
          </div>

          {/* Visibility Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Visibility & Access
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <VisibilityOption
                value="organization"
                title="Organization"
                description="Visible to all organization members"
                icon={<Building size={16} />}
                selected={watch('visibility') === 'organization'}
                onSelect={() => setValue('visibility', 'organization')}
              />
              <VisibilityOption
                value="private"
                title="Private"
                description="Only invited workspace members"
                icon={<Lock size={16} />}
                selected={watch('visibility') === 'private'}
                onSelect={() => setValue('visibility', 'private')}
              />
              <VisibilityOption
                value="public"
                title="Public"
                description="Accessible across public links"
                icon={<Globe size={16} />}
                selected={watch('visibility') === 'public'}
                onSelect={() => setValue('visibility', 'public')}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isActionLoading}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isActionLoading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
            >
              {isActionLoading && <Loader2 size={14} className="animate-spin" />}
              <span>{isEditing ? 'Save Changes' : 'Create Workspace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface VisibilityOptionProps {
  value: WorkspaceVisibility;
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

const VisibilityOption: React.FC<VisibilityOptionProps> = ({
  title,
  description,
  icon,
  selected,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
        selected
          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-500/20'
          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={selected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
          {icon}
        </span>
        <span className="text-xs font-bold">{title}</span>
      </div>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
        {description}
      </p>
    </div>
  );
};
