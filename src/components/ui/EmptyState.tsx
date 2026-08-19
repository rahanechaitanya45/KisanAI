import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center text-stone-600">
        {icon}
      </div>
      <div className="max-w-md space-y-1">
        <h4 className="text-base font-bold text-stone-900">{title}</h4>
        <p className="text-xs sm:text-sm text-stone-500">{description}</p>
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {primaryAction && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={primaryAction.icon}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="secondary"
              size="sm"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
