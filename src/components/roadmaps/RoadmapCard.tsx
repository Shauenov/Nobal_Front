'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import type { RoadmapOut } from '@/types/api';
import { useRoutePrefix } from '@/hooks/useRoutePrefix';

interface RoadmapCardProps {
  roadmap: RoadmapOut;
  taskCount?: number;
  onDelete?: () => void;
  isLoading?: boolean;
}

const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 'var(--space-2)',
};

const titleStyle: CSSProperties = {
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-primary)',
};

const descriptionStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const metaStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-4)',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
};

const badgeStyle = (variant: 'public' | 'private'): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  background: variant === 'public' ? 'var(--color-primary-light)' : 'var(--color-surface-hover)',
  color: variant === 'public' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
});

const footerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: 'var(--space-2)',
  borderTop: '1px solid var(--color-border)',
};

const buttonStyle = (variant: 'primary' | 'ghost', disabled?: boolean): CSSProperties => ({
  padding: '6px 12px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  border: 'none',
  background: variant === 'primary' ? 'var(--color-primary)' : 'transparent',
  color: variant === 'primary' ? '#fff' : 'var(--color-text-primary)',
  opacity: disabled ? 0.6 : 1,
});

export function RoadmapCard({
  roadmap,
  taskCount = 0,
  onDelete,
  isLoading = false,
}: RoadmapCardProps) {
  const prefix = useRoutePrefix();
  const createdDate = new Date(roadmap.created_at);
  const dateStr = createdDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div style={{ flex: 1 }}>
          <div style={titleStyle}>{roadmap.title}</div>
        </div>
        <div style={badgeStyle(roadmap.is_public ? 'public' : 'private')}>
          {roadmap.is_public ? '🌍 Public' : '🔒 Private'}
        </div>
      </div>

      {roadmap.description && (
        <div style={descriptionStyle}>{roadmap.description}</div>
      )}

      <div style={metaStyle}>
        {roadmap.target_type && (
          <div>
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--font-medium)' }}>
              {roadmap.target_type}
            </span>
          </div>
        )}
        {taskCount > 0 && (
          <div>
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--font-medium)' }}>
              {taskCount} task{taskCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        <div>{dateStr}</div>
      </div>

      <div style={footerStyle}>
        <div />
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {onDelete && (
            <button
              style={buttonStyle('ghost', isLoading)}
              onClick={onDelete}
              disabled={isLoading}
            >
              Delete
            </button>
          )}
          <Link href={`${prefix}/roadmaps/${roadmap.id}`} style={{ textDecoration: 'none' }}>
            <button style={buttonStyle('primary', isLoading)}>
              Edit
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
