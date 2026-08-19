import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const base = 'animate-pulse bg-stone-200/80';
  const variantStyles = {
    text: 'h-4 rounded-md w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl h-32 w-full',
  };

  const inlineStyles: React.CSSProperties = {
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...style,
  };

  return (
    <div
      className={`${base} ${variantStyles[variant]} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
};
