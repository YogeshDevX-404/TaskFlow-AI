import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { LoadingPage } from '../common/LoadingPage';

export interface PublicRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children, fallback }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) {
    return <LoadingPage message="Checking session..." />;
  }

  if (isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
