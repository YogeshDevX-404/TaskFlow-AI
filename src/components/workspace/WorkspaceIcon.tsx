import React from 'react';
import {
  Layout,
  Briefcase,
  Folder,
  Rocket,
  Sparkles,
  Code2,
  Globe,
  Shield,
  Zap,
  Compass,
  Terminal,
  Layers,
  Cpu,
  Boxes,
  LucideIcon,
} from 'lucide-react';

export const WORKSPACE_ICON_MAP: Record<string, LucideIcon> = {
  layout: Layout,
  briefcase: Briefcase,
  folder: Folder,
  rocket: Rocket,
  sparkles: Sparkles,
  code: Code2,
  globe: Globe,
  shield: Shield,
  zap: Zap,
  compass: Compass,
  terminal: Terminal,
  layers: Layers,
  cpu: Cpu,
  boxes: Boxes,
};

export interface WorkspaceIconProps {
  icon?: string;
  color?: string;
  className?: string;
  size?: number;
}

export const WorkspaceIcon: React.FC<WorkspaceIconProps> = ({
  icon = 'layout',
  color = '#4f46e5',
  className = '',
  size = 18,
}) => {
  const IconComponent = WORKSPACE_ICON_MAP[icon.toLowerCase()] || Layout;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg p-1.5 transition-transform ${className}`}
      style={{ backgroundColor: `${color}18`, color }}
    >
      <IconComponent size={size} style={{ color }} />
    </div>
  );
};
