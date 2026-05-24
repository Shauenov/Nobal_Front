'use client';

import type { Role } from '@/types/admin';
import { ADMIN_ACCENT, ADMIN_ACCENT_SOFT } from './adminTheme';

const MAP: Record<Role, { label: string; color: string; bg: string }> = {
  student: { label: 'Студент', color: '#2563eb', bg: 'rgba(37,99,235,0.10)' },
  adviser: { label: 'Куратор', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
  admin: { label: 'Администратор', color: ADMIN_ACCENT, bg: ADMIN_ACCENT_SOFT },
};

export function RoleBadge({ role }: { role: Role }) {
  const cfg = MAP[role] ?? MAP.student;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: 'var(--radius-full)',
        background: cfg.bg,
        color: cfg.color,
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
      }}
    >
      {cfg.label}
    </span>
  );
}

export default RoleBadge;
