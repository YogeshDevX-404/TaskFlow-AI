import React from 'react';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { PublicRoute } from '../components/auth/PublicRoute';

export interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
  onNavigateResetWithToken: (token: string) => void;
  authenticatedFallback?: React.ReactNode;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateLogin,
  onNavigateResetWithToken,
  authenticatedFallback,
}) => {
  return (
    <PublicRoute fallback={authenticatedFallback}>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
        <ForgotPasswordForm
          onNavigateLogin={onNavigateLogin}
          onNavigateResetWithToken={onNavigateResetWithToken}
        />
      </div>
    </PublicRoute>
  );
};
