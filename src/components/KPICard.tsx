
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  description?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
}) => {
  const changeColor = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-muted-foreground',
  }[changeType];

  return (
    <div className="glass-card rounded-xl p-6 glass-hover animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <span className={`text-sm font-medium ${changeColor}`}>
          {change}
        </span>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground/80">{description}</p>
        )}
      </div>
    </div>
  );
};

export default KPICard;
