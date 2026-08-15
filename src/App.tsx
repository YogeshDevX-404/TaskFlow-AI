import React, { useState } from 'react';
import { ApplicationProvider } from './providers/ApplicationProvider';
import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password';

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [resetToken, setResetToken] = useState<string>('');

  if (isAuthenticated) {
    return <DashboardPage />;
  }

  const renderAuthView = () => {
    switch (currentView) {
      case 'register':
        return (
          <RegisterPage
            onNavigateLogin={() => setCurrentView('login')}
            onSuccess={() => setCurrentView('login')}
            authenticatedFallback={<DashboardPage />}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordPage
            onNavigateLogin={() => setCurrentView('login')}
            onNavigateResetWithToken={(token) => {
              setResetToken(token);
              setCurrentView('reset-password');
            }}
            authenticatedFallback={<DashboardPage />}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordPage
            initialToken={resetToken}
            onNavigateLogin={() => setCurrentView('login')}
            authenticatedFallback={<DashboardPage />}
          />
        );
      case 'login':
      default:
        return (
          <LoginPage
            onNavigateRegister={() => setCurrentView('register')}
            onNavigateForgotPassword={() => setCurrentView('forgot-password')}
            onSuccess={() => setCurrentView('login')}
            authenticatedFallback={<DashboardPage />}
          />
        );
    }
  };

  return <>{renderAuthView()}</>;
};

export default function App() {
  return (
    <ApplicationProvider>
      <MainApp />
    </ApplicationProvider>
  );
}
