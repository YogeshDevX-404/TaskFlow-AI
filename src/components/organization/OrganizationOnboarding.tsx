import React, { useState } from 'react';
import { Building2, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { CreateOrganizationModal } from './CreateOrganizationModal';

export interface OrganizationOnboardingProps {
  onSkip?: () => void;
}

export const OrganizationOnboarding: React.FC<OrganizationOnboardingProps> = ({ onSkip }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl text-center space-y-8 relative overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20">
          <Building2 className="w-8 h-8" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Set Up Your Organization
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Establish a unified workspace to manage projects, assign team members, and customize your brand settings.
          </p>
        </div>

        {/* Features Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Custom Branding</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Upload logo, custom slug, and company details.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Team Spaces</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Group projects by departments or clients.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Role Security</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Owner-level permissions and archive safety.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Create Organization</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onSkip && (
            <button
              onClick={onSkip}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Skip for now
            </button>
          )}
        </div>

        <CreateOrganizationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  );
};
