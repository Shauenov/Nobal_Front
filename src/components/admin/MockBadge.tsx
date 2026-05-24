'use client';

import { FlaskConical } from 'lucide-react';

/** Honest marker for screens backed by mock data (no backend yet). */
export function MockBadge({ label = 'демо-данные' }: { label?: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-warning-bg)',
        color: 'var(--color-warning)',
        border: '1px solid rgba(245,158,11,0.3)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
      title="Данные этого раздела временно мокаются — backend будет подключён позже"
    >
      <FlaskConical size={13} />
      MOCK · {label}
    </span>
  );
}

export default MockBadge;
