import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChartDataPoint } from '../../../types/dashboard';

interface AreaChartProps {
  title?: string;
  subtitle?: string;
  data: ChartDataPoint[];
  height?: number;
}

export const AreaChartComponent: React.FC<AreaChartProps> = ({
  title = 'Task Completion Trend',
  subtitle = 'Cumulative completed items over weeks',
  data,
  height = 220,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 500;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.secondaryValue || 0)), 10);

  const getX = (idx: number) => {
    if (data.length <= 1) return paddingX + chartWidth / 2;
    return paddingX + (idx / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return height - paddingY - (val / maxValue) * chartHeight;
  };

  // Build SVG Path for primary value
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPath = `M ${getX(0)},${height - paddingY} L ${points} L ${getX(
    data.length - 1
  )},${height - paddingY} Z`;
  const linePath = `M ${points}`;

  // Secondary line path if available
  const hasSecondary = data.some((d) => d.secondaryValue !== undefined);
  const secondaryPoints = hasSecondary
    ? data.map((d, i) => `${getX(i)},${getY(d.secondaryValue || 0)}`).join(' ')
    : '';
  const secondaryLinePath = hasSecondary ? `M ${secondaryPoints}` : '';

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          {hasSecondary && (
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Completed
              </span>
              <span className="flex items-center gap-1.5 text-pink-500">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Planned Target
              </span>
            </div>
          )}
        </div>
      )}

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = height - paddingY - ratio * chartHeight;
            const val = Math.round(ratio * maxValue);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Filled Area */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            d={areaPath}
            fill="url(#areaGradient)"
          />

          {/* Secondary Target Line */}
          {hasSecondary && (
            <path
              d={secondaryLinePath}
              fill="none"
              stroke="#ec4899"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          {/* Primary Line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            d={linePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Points & Interactive Nodes */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.value);
            const isHovered = hoveredIdx === i;

            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill="#6366f1"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* X Axis Label */}
                <text
                  x={cx}
                  y={height - paddingY + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-500 dark:fill-slate-400 font-medium"
                >
                  {d.label}
                </text>

                {/* Hover Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={cx - 35}
                      y={cy - 35}
                      width="70"
                      height="24"
                      rx="6"
                      className="fill-slate-900 dark:fill-slate-100 shadow-xl"
                    />
                    <text
                      x={cx}
                      y={cy - 19}
                      textAnchor="middle"
                      className="text-[11px] font-bold fill-white dark:fill-slate-900"
                    >
                      {d.value} items
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
