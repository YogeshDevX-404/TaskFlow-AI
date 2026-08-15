import React from 'react';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { PublicRoute } from '../components/auth/PublicRoute';

export interface ResetPasswordPageProps {
  initialToken?: string;
  onNavigateLogin: () => void;
  authenticatedFallback?: React.ReactNode;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  initialToken,
  onNavigateLogin,
  authenticatedFallback,
}) => {
  return (
    <PublicRoute fallback={authenticatedFallback}>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
        <ResetPasswordForm
          initialToken={initialToken}
          onNavigateLogin={onNavigateLogin}
        />
      </div>
    </PublicRoute>
  );
};
