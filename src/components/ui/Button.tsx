import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'earth';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    icon: 'p-2 text-sm',
  };

  const variantStyles = {
    primary:
      'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs focus-visible:ring-emerald-700 active:scale-[0.99]',
    secondary:
      'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-200 focus-visible:ring-stone-400 active:scale-[0.99]',
    outline:
      'bg-transparent hover:bg-emerald-50 text-emerald-800 border border-emerald-300 hover:border-emerald-500 focus-visible:ring-emerald-600',
    ghost:
      'bg-transparent hover:bg-stone-100 text-stone-700 hover:text-stone-900 focus-visible:ring-stone-400',
    danger:
      'bg-rose-700 hover:bg-rose-800 text-white shadow-xs focus-visible:ring-rose-600',
    success:
      'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs focus-visible:ring-emerald-600',
    earth:
      'bg-amber-800 hover:bg-amber-900 text-white shadow-xs focus-visible:ring-amber-700',
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const effectiveLeftIcon = leftIcon || icon;

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        effectiveLeftIcon && <span className="shrink-0">{effectiveLeftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
