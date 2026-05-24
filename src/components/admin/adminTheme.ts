import type { CSSProperties } from 'react';

// Admin brand accent — ties pages to the AdminSidebar.
export const ADMIN_ACCENT = '#7c3aed';
export const ADMIN_ACCENT_2 = '#6d28d9';
export const ADMIN_ACCENT_SOFT = 'rgba(124,58,237,0.10)';
export const ADMIN_GRADIENT = `linear-gradient(135deg, ${ADMIN_ACCENT} 0%, ${ADMIN_ACCENT_2} 100%)`;

export const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-5)',
  boxShadow: 'var(--shadow-sm)',
};

export const sectionTitleStyle: CSSProperties = {
  fontSize: 'var(--text-lg)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  margin: 0,
};

export const labelStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
};

export const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  padding: '10px 12px',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
  outline: 'none',
};
