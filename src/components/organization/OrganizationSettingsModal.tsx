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
  Briefcase,
  AlertTriangle,
  Archive,
  RotateCcw,
  Trash2,
  Save,
} from 'lucide-react';
import {
  updateOrganizationSchema,
  UpdateOrganizationInput,
  SLUG_REGEX,
} from '../../validators/organization.validator';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { Organization } from '../../types/organization';
import { ImageUpload } from '../common/ImageUpload';
import { Spinner } from '../ui/Spinner';

export interface OrganizationSettingsModalProps {
  organization: Organization | null;
  isOpen: boolean;
  onClose: () => void;
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

export const OrganizationSettingsModal: React.FC<OrganizationSettingsModalProps> = ({
  organization,
  isOpen,
  onClose,
}) => {
  const {
    updateOrganization,
    archiveOrganization,
    restoreOrganization,
    deleteOrganization,
    isActionLoading,
    error,
    clearError,
  } = useOrganizationStore();

  const [logoUrl, setLogoUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'billing' | 'danger'>('general');
  const [deleteConfirmInput, setDeleteConfirmInput] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateOrganizationInput>({
    resolver: zodResolver(updateOrganizationSchema),
  });

  useEffect(() => {
    if (organization && isOpen) {
      reset({
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo || '',
        description: organization.description || '',
        website: organization.website || '',
        industry: organization.industry || 'Technology & Software',
        companySize: organization.companySize || '1-10 employees',
        timezone: organization.timezone || 'UTC',
        country: organization.country || 'United States',
      });
      setLogoUrl(organization.logo || '');
      setDeleteConfirmInput('');
      clearError();
    }
  }, [organization, isOpen, reset, clearError]);

  if (!isOpen || !organization) return null;

  const watchSlug = watch('slug');
  const isSlugValid = watchSlug ? SLUG_REGEX.test(watchSlug) : true;

  const onSubmit = async (data: UpdateOrganizationInput) => {
    const finalLogo = logoUrl || data.logo || '';
    const success = await updateOrganization(organization.id, { ...data, logo: finalLogo });
    if (success) {
      onClose();
    }
  };

  const handleArchiveToggle = async () => {
    if (organization.isArchived) {
      await restoreOrganization(organization.id);
    } else {
      await archiveOrganization(organization.id);
    }
    onClose();
  };

  const handleDeletePermanent = async () => {
    if (deleteConfirmInput.trim().toLowerCase() !== organization.name.trim().toLowerCase()) {
      return;
    }
    const success = await deleteOrganization(organization.id);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            {organization.logo ? (
              <img
                src={organization.logo}
                alt={organization.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                {organization.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{organization.name}</span>
                {organization.isArchived && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    Archived
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {organization.slug}
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

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            General Details
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'branding'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Branding & Logo
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'billing'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Billing & Usage
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'danger'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Danger Zone
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    {...register('slug')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  {!isSlugValid && (
                    <p className="text-[11px] text-rose-500 mt-1">Invalid slug format</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  {...register('description')}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Industry
                  </label>
                  <select
                    {...register('industry')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    {COMPANY_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" /> Website
                  </label>
                  <input
                    type="text"
                    {...register('website')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-slate-400" /> Country
                  </label>
                  <input
                    type="text"
                    {...register('country')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Timezone
                </label>
                <select
                  {...register('timezone')}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz} value={tz.split(' ')[0]}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-4">
              <ImageUpload
                value={logoUrl}
                onChange={(val) => {
                  setLogoUrl(val);
                  setValue('logo', val);
                }}
                label="Organization Branding Logo"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your logo will be visible across project headers, invoices, emails, and workspace switchers.
              </p>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-6">
              {/* Archive Section */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Archive className="w-4 h-4" />
                    {organization.isArchived ? 'Restore Organization' : 'Archive Organization'}
                  </h4>
                  <p className="text-[11px] text-amber-600/80 dark:text-amber-300/80 mt-0.5">
                    {organization.isArchived
                      ? 'Reactivate this organization and bring its projects back into active status.'
                      : 'Archiving makes this workspace read-only and hides it from primary active list views.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleArchiveToggle}
                  disabled={isActionLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    organization.isArchived
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {organization.isArchived ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" /> Restore Workspace
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5" /> Archive Workspace
                    </>
                  )}
                </button>
              </div>

              {/* Permanent Delete Section */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4" /> Delete Organization Permanently
                  </h4>
                  <p className="text-[11px] text-rose-500/80 dark:text-rose-300/80 mt-0.5">
                    Permanently delete this organization. This action cannot be undone and will delete associated configurations.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Type <span className="font-mono font-bold">{organization.name}</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    placeholder={organization.name}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDeletePermanent}
                  disabled={
                    isActionLoading ||
                    deleteConfirmInput.trim().toLowerCase() !== organization.name.trim().toLowerCase()
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isActionLoading ? <Spinner size="sm" className="text-white" /> : <Trash2 className="w-4 h-4" />}
                  <span>Confirm Permanent Deletion</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6 text-sm">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <h4 className="font-bold text-xs text-indigo-700 dark:text-indigo-400">Current Plan: Professional (Pro)</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Active Subscription renewed via dynamic provider checkout.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Workspace Limits</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">10 / Unlimited</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Storage Quota</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">1.2 GB / 10 GB</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">Available Plan Upgrades</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border-2 border-indigo-600 bg-white dark:bg-slate-800 shadow-xs relative">
                    <span className="absolute top-2 right-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">ACTIVE</span>
                    <h5 className="font-bold text-xs">Professional</h5>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">$29<span className="text-xs font-normal text-slate-500">/mo</span></span>
                    <ul className="text-[11px] text-slate-500 space-y-1 mt-2">
                      <li>• Up to 20 users</li>
                      <li>• 10 GB Storage space</li>
                      <li>• Unlimited projects</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 transition-colors">
                    <h5 className="font-bold text-xs">Enterprise</h5>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">$99<span className="text-xs font-normal text-slate-500">/mo</span></span>
                    <ul className="text-[11px] text-slate-500 space-y-1 mt-2">
                      <li>• Unlimited users</li>
                      <li>• 100 GB Storage space</li>
                      <li>• Custom integrations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save for General & Branding */}
          {activeTab !== 'danger' && activeTab !== 'billing' && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
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
                  <Spinner size="sm" className="text-white" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
