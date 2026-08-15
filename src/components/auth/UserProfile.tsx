import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon, Lock, Shield, CheckCircle, LogOut, AlertCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Spinner } from '../ui/Spinner';
import { GitHubIntegrationSection } from '../settings/GitHubIntegrationSection';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(
        passwordRegex,
        'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)'
      ),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const UserProfile: React.FC = () => {
  const { user, logout, changePassword, isLoading, error, clearError } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmitChangePassword = async (data: ChangePasswordFormData) => {
    clearError();
    setSuccessMessage(null);
    const success = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    if (success) {
      setSuccessMessage('Your password has been changed successfully.');
      reset();
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 sm:p-10">
      {/* Header Profile Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-2xl relative overflow-hidden border border-indigo-500/20">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-2xl shadow-inner">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {user.firstName} {user.lastName}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {user.role}
              </span>
              {user.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 font-mono">{user.email}</p>
            <p className="text-xs text-slate-400">
              User ID: <span className="font-mono text-slate-300">{user.id}</span>
            </p>
          </div>

          <button
            onClick={() => logout()}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition flex items-center gap-2 backdrop-blur-sm border border-white/10"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Grid: Account Details & Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Details */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <UserIcon className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">Account Details</h2>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Full Name
              </span>
              <p className="font-medium text-slate-900 dark:text-white">
                {user.firstName} {user.lastName}
              </p>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Email Address
              </span>
              <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Role & Access
              </span>
              <p className="font-medium text-slate-900 dark:text-white capitalize">{user.role} Level</p>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Account Created
              </span>
              <p className="font-medium text-slate-900 dark:text-white">
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">Security & Password</h2>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmitChangePassword)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                {...register('currentPassword')}
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.currentPassword && (
                <p className="text-xs text-rose-500 mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                {...register('newPassword')}
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.newPassword && (
                <p className="text-xs text-rose-500 mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                {...register('confirmNewPassword')}
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.confirmNewPassword && (
                <p className="text-xs text-rose-500 mt-1">{errors.confirmNewPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* GitHub Integration Section */}
      <GitHubIntegrationSection />
    </div>
  );
};
