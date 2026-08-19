import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'earth' | 'purple';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  };

  const variantStyles = {
    primary: 'bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-semibold',
    neutral: 'bg-stone-100/90 text-stone-700 border border-stone-200 font-medium',
    success: 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold',
    warning: 'bg-amber-50 text-amber-900 border border-amber-200 font-semibold',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200 font-semibold',
    info: 'bg-sky-50 text-sky-800 border border-sky-200 font-semibold',
    earth: 'bg-amber-50/80 text-amber-950 border border-amber-200 font-semibold',
    purple: 'bg-purple-50 text-purple-800 border border-purple-200 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full tracking-tight ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
