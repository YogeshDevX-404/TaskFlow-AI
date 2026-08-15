import React, { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LoadingPage } from '../components/common/LoadingPage';

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isInitializing) {
    return <LoadingPage message="Authenticating session credentials..." />;
  }

  return <>{children}</>;
};
