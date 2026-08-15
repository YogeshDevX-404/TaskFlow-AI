import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X,
  Building2,
  Globe,
  Globe2,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import {
  createOrganizationSchema,
  CreateOrganizationInput,
  generateSlug,
  SLUG_REGEX,
} from '../../validators/organization.validator';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { ImageUpload } from '../common/ImageUpload';
import { Spinner } from '../ui/Spinner';

export interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const INDUSTRY_OPTIONS = [
  'Technology & Software',
  'Finance & Banking',
  'Healthcare & Life Sciences',
  'E-Commerce & Retail',
  'Marketing & Advertising',
  'Education & EdTech',
  'Manufacturing & Logistics',
  'Consulting & Professional Services',
  'Media & Entertainment',
  'Real Estate & Construction',
  'Other',
];

const COMPANY_SIZE_OPTIONS = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
];

const TIMEZONE_OPTIONS = [
  'UTC',
  'America/New_York (EST)',
  'America/Chicago (CST)',
  'America/Denver (MST)',
  'America/Los_Angeles (PST)',
  'Europe/London (GMT)',
  'Europe/Paris (CET)',
  'Asia/Tokyo (JST)',
  'Asia/Kolkata (IST)',
  'Australia/Sydney (AEST)',
];

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createOrganization, isActionLoading, error, clearError } = useOrganizationStore();
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isCustomSlugEdited, setIsCustomSlugEdited] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      slug: '',
      logo: '',
      description: '',
      website: '',
      industry: 'Technology & Software',
      companySize: '1-10 employees',
      timezone: 'UTC',
      country: 'United States',
    },
  });

  const watchName = watch('name');
  const watchSlug = watch('slug');

  // Auto-generate slug when name changes, unless user manually edited slug
  useEffect(() => {
    if (!isCustomSlugEdited && watchName) {
      const autoSlug = generateSlug(watchName);
      setValue('slug', autoSlug, { shouldValidate: true });
    }
  }, [watchName, isCustomSlugEdited, setValue]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setLogoUrl('');
      setIsCustomSlugEdited(false);
      clearError();
    }
  }, [isOpen, reset, clearError]);

  if (!isOpen) return null;

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomSlugEdited(true);
    setValue('slug', e.target.value, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateOrganizationInput) => {
    const finalLogo = logoUrl || data.logo || '';
    const created = await createOrganization({ ...data, logo: finalLogo });
    if (created) {
      reset();
      setLogoUrl('');
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const isSlugValid = watchSlug ? SLUG_REGEX.test(watchSlug) : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Organization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Establish an enterprise workspace for your team and projects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Logo Upload */}
          <ImageUpload
            value={logoUrl}
            onChange={(val) => {
              setLogoUrl(val);
              setValue('logo', val);
            }}
            label="Organization Logo & Icon"
            helperText="Upload SVG, PNG, JPG or WebP (max 5MB)"
          />

          {/* Name & Slug Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Organization Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Acme Corp"
                  {...register('name')}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                <span>URL Slug</span>
                {watchSlug && isSlugValid && (
                  <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 normal-case">
                    <CheckCircle2 className="w-3 h-3" /> Valid
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={watchSlug || ''}
                  onChange={handleSlugChange}
                  placeholder="acme-corp"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Workspace URL: <span className="font-mono text-indigo-500">app.taskflow.com/{watchSlug || 'slug'}</span>
              </p>
              {errors.slug && (
                <p className="text-[11px] text-rose-500 mt-0.5 font-medium">{errors.slug.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Description / Mission
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of your company, team, or venture..."
              {...register('description')}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Industry & Company Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Industry
              </label>
              <select
                {...register('industry')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {INDUSTRY_OPTIONS.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" /> Company Size
              </label>
              <select
                {...register('companySize')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {COMPANY_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Website & Country Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Website URL
              </label>
              <input
                type="text"
                placeholder="https://acme.com"
                {...register('website')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-slate-400" /> Country
              </label>
              <input
                type="text"
                placeholder="United States"
                {...register('country')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Timezone
            </label>
            <select
              {...register('timezone')}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz.split(' ')[0]}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isActionLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isActionLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isActionLoading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  <span>Creating Organization...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
