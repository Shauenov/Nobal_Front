'use client';

import React, { CSSProperties } from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  style?: CSSProperties;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const bg =
    variant === 'primary'
      ? 'var(--color-primary)'
      : variant === 'success'
      ? 'var(--color-success)'
      : variant === 'danger'
      ? 'var(--color-error)'
      : variant === 'warning'
      ? 'var(--color-warning)'
      : variant === 'info'
      ? 'var(--color-info)'
      : variant === 'neutral'
      ? 'var(--color-surface-elevated)'
      : 'var(--color-surface-elevated)';
  const color = variant === 'default' ? 'var(--color-text-primary)' : '#fff';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        background: bg,
        color,
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-medium)',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export default Badge;
