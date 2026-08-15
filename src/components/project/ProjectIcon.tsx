import React from 'react';
import {
  Folder,
  Code,
  Layers,
  Target,
  Shield,
  Briefcase,
  Layout,
  Palette,
  Server,
  Zap,
  Cpu,
  Globe,
  Database,
  Terminal,
  Activity,
  Box,
  Compass,
} from 'lucide-react';

interface ProjectIconProps {
  icon?: string;
  className?: string;
  iconClassName?: string;
  color?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  folder: Folder,
  code: Code,
  layers: Layers,
  target: Target,
  shield: Shield,
  layout: Layout,
  palette: Palette,
  server: Server,
  zap: Zap,
  cpu: Cpu,
  globe: Globe,
  database: Database,
  terminal: Terminal,
  activity: Activity,
  box: Box,
  compass: Compass,
};

export const ProjectIcon: React.FC<ProjectIconProps> = ({
  icon = 'briefcase',
  className = 'w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
  iconClassName = 'w-5 h-5',
}) => {
  // If emoji or custom string
  if (icon && icon.length <= 2) {
    return (
      <div className={className}>
        <span className="text-lg">{icon}</span>
      </div>
    );
  }

  const IconComponent = ICON_MAP[icon.toLowerCase()] || Briefcase;

  return (
    <div className={className}>
      <IconComponent className={iconClassName} />
    </div>
  );
};
