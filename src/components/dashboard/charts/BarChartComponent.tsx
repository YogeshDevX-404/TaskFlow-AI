import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChartDataPoint } from '../../../types/dashboard';

interface BarChartProps {
  title?: string;
  subtitle?: string;
  data: ChartDataPoint[];
}

export const BarChartComponent: React.FC<BarChartProps> = ({
  title = 'Tasks by Status',
  subtitle = 'Current backlog and workflow status distribution',
  data,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 10);

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {(title || subtitle) && (
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      )}

      <div className="space-y-3 pt-1">
        {data.map((item, idx) => {
          const percentage = Math.round((item.value / maxValue) * 100);
          const barColor = item.color || '#6366f1';
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={item.label}
              className="space-y-1 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: barColor }}
                  />
                  {item.label}
                </span>
                <span className="text-slate-900 dark:text-slate-100 font-mono">
                  {item.value} <span className="text-slate-400 font-normal">({percentage}%)</span>
                </span>
              </div>

              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.08 }}
                  className={`h-full rounded-full transition-opacity ${
                    isHovered ? 'opacity-100 ring-2 ring-indigo-400' : 'opacity-90'
                  }`}
                  style={{ backgroundColor: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
