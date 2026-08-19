import React from 'react';
import { Card } from './Card';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  iconBgColor?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBgColor = 'bg-emerald-50 text-emerald-700 border-emerald-200',
  badge,
  onClick,
  className = '',
}) => {
  return (
    <Card
      variant={onClick ? 'interactive' : 'standard'}
      padding="md"
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-stone-900 tracking-tight">
              {value}
            </h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-stone-600 font-medium">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`text-xs font-semibold flex items-center gap-1 ${
                trend.isPositive ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
              {trend.label && (
                <span className="text-stone-400 font-normal">
                  {trend.label}
                </span>
              )}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${iconBgColor}`}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
