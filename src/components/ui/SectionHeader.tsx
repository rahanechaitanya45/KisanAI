import React from 'react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80 ${className}`}
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-stone-500">{subtitle}</p>
        )}
      </div>

      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
};
