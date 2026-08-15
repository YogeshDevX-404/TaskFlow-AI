import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';
import { PublicRoute } from '../components/auth/PublicRoute';

export interface RegisterPageProps {
  onNavigateLogin: () => void;
  onSuccess: () => void;
  authenticatedFallback?: React.ReactNode;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateLogin,
  onSuccess,
  authenticatedFallback,
}) => {
  return (
    <PublicRoute fallback={authenticatedFallback}>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
        <RegisterForm onSuccess={onSuccess} onNavigateLogin={onNavigateLogin} />
      </div>
    </PublicRoute>
  );
};
