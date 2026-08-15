import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChartDataPoint } from '../../../types/dashboard';

interface PieChartProps {
  title?: string;
  subtitle?: string;
  data: ChartDataPoint[];
}

export const PieChartComponent: React.FC<PieChartProps> = ({
  title = 'Task Allocation by Module',
  subtitle = 'Workload breakdown across technical domain layers',
  data,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const size = 180;
  const center = size / 2;
  const radius = 70;
  const strokeWidth = 24;

  let cumulativeAngle = 0;

  const defaultColors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {(title || subtitle) && (
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
        {/* SVG Donut */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
            {data.map((item, idx) => {
              const sliceAngle = (item.value / total) * 360;
              const startAngle = cumulativeAngle;
              cumulativeAngle += sliceAngle;

              // Compute SVG dasharray
              const circumference = 2 * Math.PI * radius;
              const strokeDasharray = `${(sliceAngle / 360) * circumference} ${circumference}`;
              const strokeDashoffset = -((startAngle / 360) * circumference);

              const color = item.color || defaultColors[idx % defaultColors.length];
              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={item.label}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Donut Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xs text-slate-400 font-medium">Total</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {hoveredIdx !== null ? data[hoveredIdx].value : total}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 flex-1 min-w-0 w-full">
          {data.map((item, idx) => {
            const color = item.color || defaultColors[idx % defaultColors.length];
            const percentage = Math.round((item.value / total) * 100);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.label}
                className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  isHovered ? 'bg-slate-100 dark:bg-slate-800 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono">
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">{item.value}</span>
                  <span className="text-slate-400 text-[11px]">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
