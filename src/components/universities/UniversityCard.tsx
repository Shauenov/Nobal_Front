'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { UniversityOut } from '@/types/api';

interface UniversityCardProps {
  university: UniversityOut;
  programCount?: number;
  onTogglePublished?: (published: boolean) => void;
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
  transition: 'all 0.2s ease',
  cursor: 'pointer',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-3)',
  alignItems: 'flex-start',
};

const logoStyle: CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface-hover)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  fontSize: '32px',
};

const infoStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const nameStyle: CSSProperties = {
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-primary)',
  marginBottom: '4px',
  wordBreak: 'break-word',
};

const locationStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
};

const metricsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: 'var(--space-2)',
};

const metricItemStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const metricLabelStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
  fontWeight: 'var(--font-medium)',
};

const metricValueStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-primary)',
};

const badgeStyle = (variant: 'primary' | 'secondary'): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  background: variant === 'primary' ? 'var(--color-primary-light)' : 'var(--color-surface-hover)',
  color: variant === 'primary' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
});

const footerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: 'var(--space-2)',
  borderTop: '1px solid var(--color-border)',
};

const buttonGroupStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-2)',
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

const toggleButtonStyle = (isPublished: boolean): CSSProperties => ({
  padding: '6px 12px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  cursor: 'pointer',
  border: '1px solid var(--color-border)',
  background: isPublished ? 'var(--color-success-light)' : 'var(--color-surface-hover)',
  color: isPublished ? 'var(--color-success)' : 'var(--color-text-secondary)',
});

export function UniversityCard({
  university,
  programCount = 0,
  onTogglePublished,
  onDelete,
  isLoading = false,
}: UniversityCardProps) {
  const location = [university.city, university.country].filter(Boolean).join(', ') || university.country;

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div style={logoStyle}>
          {university.logo_url ? (
            <Image
              src={university.logo_url}
              alt={university.name}
              width={64}
              height={64}
              style={{ objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
            />
          ) : (
            <span>🏫</span>
          )}
        </div>

        <div style={infoStyle}>
          <Link href={`/universities/${university.id}`} style={{ textDecoration: 'none' }}>
            <div style={nameStyle} onMouseOver={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}>
              {university.name}
            </div>
          </Link>
          <div style={locationStyle}>{location}</div>
        </div>
      </div>

      <div style={metricsStyle}>
        {university.qs_ranking !== null && university.qs_ranking !== undefined && (
          <div style={metricItemStyle}>
            <div style={metricLabelStyle}>QS Ranking</div>
            <div style={metricValueStyle}>#{university.qs_ranking}</div>
          </div>
        )}
        {university.acceptance_rate !== null && university.acceptance_rate !== undefined && (
          <div style={metricItemStyle}>
            <div style={metricLabelStyle}>Acceptance</div>
            <div style={metricValueStyle}>{(university.acceptance_rate * 100).toFixed(1)}%</div>
          </div>
        )}
        {university.language_of_instr && (
          <div style={metricItemStyle}>
            <div style={metricLabelStyle}>Language</div>
            <div style={metricValueStyle}>{university.language_of_instr}</div>
          </div>
        )}
        {programCount > 0 && (
          <div style={metricItemStyle}>
            <div style={metricLabelStyle}>Programs</div>
            <div style={metricValueStyle}>{programCount}</div>
          </div>
        )}
      </div>

      <div style={footerStyle}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <div style={badgeStyle(university.is_published ? 'primary' : 'secondary')}>
            {university.is_published ? '✓ Published' : '○ Draft'}
          </div>
        </div>

        <div style={buttonGroupStyle}>
          {onTogglePublished && (
            <button
              style={toggleButtonStyle(university.is_published)}
              onClick={() => onTogglePublished(!university.is_published)}
              disabled={isLoading}
              title={university.is_published ? 'Unpublish' : 'Publish'}
            >
              {university.is_published ? 'Published' : 'Draft'}
            </button>
          )}
          {onDelete && (
            <button
              style={buttonStyle('ghost', isLoading)}
              onClick={onDelete}
              disabled={isLoading}
            >
              Delete
            </button>
          )}
          <Link href={`/universities/${university.id}`} style={{ textDecoration: 'none' }}>
            <button style={buttonStyle('primary', isLoading)}>
              View
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
