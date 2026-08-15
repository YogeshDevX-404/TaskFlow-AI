import React from 'react';
import { useWorkloadRecommendations } from '../../hooks/useWorkload';
import { Lightbulb, AlertTriangle, Info, CheckCircle2, SlidersHorizontal, ArrowRight } from 'lucide-react';

interface SmartRecommendationsCardProps {
  organizationId?: string;
  workspaceId?: string;
  onOpenBulkReassign?: () => void;
}

export const SmartRecommendationsCard: React.FC<SmartRecommendationsCardProps> = ({
  organizationId,
  workspaceId,
  onOpenBulkReassign,
}) => {
  const { data, isLoading } = useWorkloadRecommendations({
    organizationId,
    workspaceId,
  });

  const recommendations = data?.recommendations || [];

  const getSeverityStyle = (severity: 'high' | 'medium' | 'info') => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
          icon: <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        };
      default:
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
          icon: <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />,
          badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4 mb-8">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Workload Recommendations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Data-driven resource balancing and allocation suggestions
            </p>
          </div>
        </div>

        {onOpenBulkReassign && (
          <button
            onClick={onOpenBulkReassign}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Reassign Work
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 text-center animate-pulse text-xs text-slate-400">
          Analyzing capacity and task allocations...
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          Optimal team workload distribution detected! No critical adjustments required.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const style = getSeverityStyle(rec.severity);
            return (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border ${style.bg} space-y-2 text-xs flex flex-col justify-between`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      {style.icon}
                      <span>{rec.title}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${style.badge}`}>
                      {rec.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rec.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
