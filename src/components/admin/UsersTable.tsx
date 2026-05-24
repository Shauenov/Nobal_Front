'use client';

import { type CSSProperties } from 'react';
import { Eye, Power, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import type { AdminUser } from '@/types/admin';
import { RoleBadge } from './RoleBadge';
import { StatusPill } from './StatusPill';
import { ADMIN_ACCENT } from './adminTheme';

type SortBy = 'full_name' | 'created_at' | 'role';

interface UsersTableProps {
  users: AdminUser[];
  sortBy: SortBy;
  sortDir: 'asc' | 'desc';
  onSort: (col: SortBy) => void;
  onView: (u: AdminUser) => void;
  onToggleActive: (u: AdminUser) => void;
  onDelete: (u: AdminUser) => void;
}

const th: CSSProperties = {
  textAlign: 'left',
  padding: 'var(--space-3) var(--space-4)',
  color: 'var(--color-text-secondary)',
  fontWeight: 600,
  fontSize: 'var(--text-xs)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};

const td: CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-primary)',
  borderTop: '1px solid var(--color-border)',
  verticalAlign: 'middle',
};

const iconBtn: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--color-text-secondary)',
};

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
}

export function UsersTable({ users, sortBy, sortDir, onSort, onView, onToggleActive, onDelete }: UsersTableProps) {
  const sortHead = (col: SortBy, label: string) => (
    <th key={col} style={{ ...th, cursor: 'pointer', userSelect: 'none' }} onClick={() => onSort(col)}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        {sortBy === col && (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
      </span>
    </th>
  );

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-hover)' }}>
              {sortHead('full_name', 'Пользователь')}
              {sortHead('role', 'Роль')}
              <th style={th}>Статус</th>
              {sortHead('created_at', 'Создан')}
              <th style={th}>Последний вход</th>
              <th style={{ ...th, textAlign: 'right' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                style={{ transition: 'background 120ms ease', cursor: 'default' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-full)',
                        background: `color-mix(in srgb, ${ADMIN_ACCENT} 14%, transparent)`,
                        color: ADMIN_ACCENT,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {initials(u.full_name)}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{u.full_name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={td}><RoleBadge role={u.role} /></td>
                <td style={td}><StatusPill active={u.is_active} /></td>
                <td style={{ ...td, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                  {format(new Date(u.created_at), 'dd.MM.yyyy')}
                </td>
                <td style={{ ...td, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                  {u.last_login_at ? format(new Date(u.last_login_at), 'dd.MM.yyyy') : '—'}
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button style={iconBtn} title="Подробнее" onClick={() => onView(u)}>
                      <Eye size={15} />
                    </button>
                    <button
                      style={iconBtn}
                      title={u.is_active ? 'Деактивировать' : 'Активировать'}
                      onClick={() => onToggleActive(u)}
                    >
                      <Power size={15} color={u.is_active ? 'var(--color-success)' : 'var(--color-text-disabled)'} />
                    </button>
                    <button
                      style={{ ...iconBtn, color: 'var(--color-error)' }}
                      title="Удалить"
                      onClick={() => onDelete(u)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersTable;
