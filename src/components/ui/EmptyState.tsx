'use client';

import React, { CSSProperties } from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  style?: CSSProperties;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title = 'No items', description = '', style, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-6)',
        color: 'var(--color-text-secondary)',
        ...style,
      }}
    >
      <div style={{ fontSize: 32 }}>{icon ?? '📭'}</div>
      <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>{title}</h3>
      {description && <p style={{ margin: 0 }}>{description}</p>}
      {actionLabel && onAction ? (
        <button
          onClick={onAction}
          style={{ marginTop: 'var(--space-3)', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: '#fff', border: 'none' }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export default EmptyState;
