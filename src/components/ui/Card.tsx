'use client';

import React, { CSSProperties, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outline';
}

export function Card({ children, style, className, padding = 'md', variant = 'default' }: CardProps) {
  const paddingMap: Record<string, string> = {
    sm: 'var(--space-3)',
    md: 'var(--space-4)',
    lg: 'var(--space-6)',
  };
  const variantStyles: Record<string, Partial<CSSProperties>> = {
    default: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
    },
    elevated: {
      background: 'var(--color-surface)',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-md)',
    },
    outline: {
      background: 'transparent',
      border: '1px solid var(--color-border)',
      boxShadow: 'none',
    },
  };

  return (
    <div
      className={className}
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: paddingMap[padding] || paddingMap.md,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Card;
