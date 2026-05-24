'use client';

import { format } from 'date-fns';
import type { AuditEntry, AuditSeverity } from '@/types/admin';

const SEV: Record<AuditSeverity, { label: string; color: string; bg: string }> = {
  info: { label: 'инфо', color: 'var(--color-info)', bg: 'var(--color-info-bg)' },
  warning: { label: 'внимание', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  critical: { label: 'критично', color: 'var(--color-error)', bg: 'var(--color-error-bg)' },
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: 'var(--space-3) var(--space-4)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-primary)',
  borderTop: '1px solid var(--color-border)',
  whiteSpace: 'nowrap',
};

export function AuditLogTable({ entries }: { entries: AuditEntry[] }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto', maxHeight: 480, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-hover)', position: 'sticky', top: 0 }}>
              <th style={th}>Время</th>
              <th style={th}>Действие</th>
              <th style={th}>Объект</th>
              <th style={th}>Кто</th>
              <th style={th}>IP</th>
              <th style={th}>Уровень</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const s = SEV[e.severity];
              return (
                <tr key={e.id}>
                  <td style={{ ...td, color: 'var(--color-text-secondary)' }}>{format(new Date(e.created_at), 'dd.MM HH:mm')}</td>
                  <td style={td}>{e.action}</td>
                  <td style={{ ...td, color: 'var(--color-text-secondary)' }}>{e.target}</td>
                  <td style={{ ...td, color: 'var(--color-text-secondary)' }}>{e.actor}</td>
                  <td style={{ ...td, color: 'var(--color-text-disabled)', fontFamily: 'var(--font-mono)' }}>{e.ip}</td>
                  <td style={td}>
                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: s.bg, color: s.color, fontSize: 'var(--text-xs)', fontWeight: 600 }}>{s.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditLogTable;
