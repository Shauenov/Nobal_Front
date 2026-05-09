import type { CSSProperties } from 'react';

interface ViewToggleProps {
  view: 'list' | 'board';
  onChange: (view: 'list' | 'board') => void;
}

const toggleContainer: CSSProperties = {
  display: 'inline-flex',
  background: 'var(--color-surface-hover)',
  borderRadius: 'var(--radius-md)',
  padding: '4px',
};

const buttonStyle = (active: boolean): CSSProperties => ({
  padding: '6px 12px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
  background: active ? 'var(--color-surface)' : 'transparent',
  border: 'none',
  boxShadow: active ? 'var(--shadow-sm)' : 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
});

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div style={toggleContainer}>
      <button style={buttonStyle(view === 'board')} onClick={() => onChange('board')}>
        Board
      </button>
      <button style={buttonStyle(view === 'list')} onClick={() => onChange('list')}>
        List
      </button>
    </div>
  );
}
