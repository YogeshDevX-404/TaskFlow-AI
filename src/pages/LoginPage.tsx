import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { PublicRoute } from '../components/auth/PublicRoute';

export interface LoginPageProps {
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onSuccess: () => void;
  authenticatedFallback?: React.ReactNode;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateRegister,
  onNavigateForgotPassword,
  onSuccess,
  authenticatedFallback,
}) => {
  return (
    <PublicRoute fallback={authenticatedFallback}>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
        <LoginForm
          onSuccess={onSuccess}
          onNavigateRegister={onNavigateRegister}
          onNavigateForgotPassword={onNavigateForgotPassword}
        />
      </div>
    </PublicRoute>
  );
};
