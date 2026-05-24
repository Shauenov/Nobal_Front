'use client';

import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { AuditEntry, AuditSeverity } from '@/types/admin';

const SEV_COLOR: Record<AuditSeverity, string> = {
  info: 'var(--color-info)',
  warning: 'var(--color-warning)',
  critical: 'var(--color-error)',
};

export function ActivityFeed({ items }: { items: AuditEntry[] }) {
  if (items.length === 0) {
    return (
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
        Нет недавней активности
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((e, i) => (
        <div
          key={e.id}
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            alignItems: 'flex-start',
            padding: 'var(--space-3) 0',
            borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: SEV_COLOR[e.severity],
              marginTop: 6,
              flexShrink: 0,
              boxShadow: `0 0 0 3px color-mix(in srgb, ${SEV_COLOR[e.severity]} 18%, transparent)`,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
              {e.action} · <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>{e.target}</span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-disabled)', marginTop: 2 }}>
              {e.actor} · {formatDistanceToNow(new Date(e.created_at), { addSuffix: true, locale: ru })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityFeed;
