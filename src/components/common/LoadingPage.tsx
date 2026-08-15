import React from 'react';
import { Spinner } from '../ui/Spinner';

export interface LoadingPageProps {
  message?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ message = 'Loading workspace resources...' }) => {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 gap-4">
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-lg">
        <Spinner size="lg" />
      </div>
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 animate-pulse">{message}</p>
    </div>
  );
};
