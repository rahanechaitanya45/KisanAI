import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'standard' | 'highlight' | 'interactive' | 'alert' | 'ai' | 'elevated' | 'danger';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'standard',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  };

  const variantStyles = {
    standard: 'bg-white border border-stone-200/80 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]',
    highlight:
      'bg-gradient-to-br from-emerald-50/40 via-white to-white border border-emerald-200/70 rounded-2xl shadow-[0_2px_8px_-2px_rgba(21,128,61,0.05)]',
    interactive:
      'bg-white border border-stone-200/80 hover:border-emerald-400 hover:shadow-[0_6px_18px_-3px_rgba(21,128,61,0.08)] transition-all duration-200 rounded-2xl cursor-pointer hover:-translate-y-0.5',
    alert: 'bg-amber-50/60 border border-amber-200/80 border-l-4 border-l-amber-500 rounded-2xl',
    ai: 'bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white text-stone-900 border border-emerald-200/80 rounded-2xl shadow-[0_2px_10px_-2px_rgba(21,128,61,0.06)]',
    elevated: 'bg-white border border-stone-200/80 rounded-2xl shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.07)] transition-shadow',
    danger: 'bg-rose-50/60 border border-rose-200/80 border-l-4 border-l-rose-500 rounded-2xl',
  };

  return (
    <div
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
