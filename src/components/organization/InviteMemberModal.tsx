import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X,
  UserPlus,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Send,
  Users,
  Eye,
  Crown,
} from 'lucide-react';
import {
  inviteMemberSchema,
  InviteMemberInput,
} from '../../validators/member.validator';
import { useInviteMember } from '../../hooks/useInviteMember';
import { useInvitations } from '../../hooks/useInvitations';
import { MemberRole } from '../../types/organization';
import { useRoleStore } from '../../store/useRoleStore';
import { Spinner } from '../ui/Spinner';

export interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ROLE_DESCRIPTIONS: Record<
  MemberRole,
  { title: string; desc: string; icon: React.ReactNode; color: string }
> = {
  admin: {
    title: 'Admin',
    desc: 'Can manage organization settings, members, projects, and billing.',
    icon: <Shield className="w-4 h-4 text-indigo-500" />,
    color: 'border-indigo-500/30 bg-indigo-500/5',
  },
  member: {
    title: 'Member',
    desc: 'Can create and edit projects, tasks, and collaborate with team members.',
    icon: <Users className="w-4 h-4 text-emerald-500" />,
    color: 'border-emerald-500/30 bg-emerald-500/5',
  },
  guest: {
    title: 'Guest',
    desc: 'Limited view-only access to assigned projects and tasks.',
    icon: <Eye className="w-4 h-4 text-amber-500" />,
    color: 'border-amber-500/30 bg-amber-500/5',
  },
  owner: {
    title: 'Owner',
    desc: 'Full administrative ownership of organization resources.',
    icon: <Crown className="w-4 h-4 text-purple-500" />,
    color: 'border-purple-500/30 bg-purple-500/5',
  },
};

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { sendInvite, isActionLoading, error, clearError } = useInviteMember();
  const { refreshInvitations } = useInvitations();
  const { roles } = useRoleStore();
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema) as any,
    defaultValues: {
      email: '',
      role: 'admin',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedRole('admin');
      setSuccessMessage(null);
      clearError();
    }
  }, [isOpen, reset, clearError]);

  if (!isOpen) return null;

  const handleRoleSelect = (roleSlugOrId: string) => {
    setSelectedRole(roleSlugOrId);
    setValue('role', roleSlugOrId as any, { shouldValidate: true });
  };

  const onSubmit = async (data: InviteMemberInput) => {
    setSuccessMessage(null);
    clearError();
    const result = await sendInvite(data);
    if (result) {
      setSuccessMessage(`Invitation successfully sent to ${data.email}`);
      refreshInvitations();
      setTimeout(() => {
        reset();
        setSuccessMessage(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Invite Organization Member
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send an email invitation with role-based access permissions
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

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="colleague@company.com"
                {...register('email')}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Select Role & Permissions
            </label>
            <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {roles.length > 0
                ? roles
                    .filter((r) => r.slug !== 'owner' && r.name.toLowerCase() !== 'owner')
                    .map((r) => {
                      const roleKey = r.slug || r.id;
                      const isSelected = selectedRole === roleKey || selectedRole === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => handleRoleSelect(roleKey)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                          }`}
                        >
                          <Shield className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{r.name}</span>
                                {r.isSystem && (
                                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.2 rounded font-normal">
                                    System
                                  </span>
                                )}
                              </span>
                              <input
                                type="radio"
                                name="role"
                                checked={isSelected}
                                onChange={() => handleRoleSelect(roleKey)}
                                className="text-indigo-600 focus:ring-indigo-500"
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-1">
                              {r.description || 'Access role for workspace members.'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                : (['admin', 'member', 'guest'] as const).map((roleKey) => {
                    const info = ROLE_DESCRIPTIONS[roleKey];
                    const isSelected = selectedRole === roleKey;
                    return (
                      <div
                        key={roleKey}
                        onClick={() => handleRoleSelect(roleKey)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? `${info.color} ring-2 ring-indigo-500/20`
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                        }`}
                      >
                        <div className="mt-0.5">{info.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {info.title}
                            </span>
                            <input
                              type="radio"
                              name="role"
                              checked={isSelected}
                              onChange={() => handleRoleSelect(roleKey)}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {info.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
            </div>
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
                  <span>Sending Invitation...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
