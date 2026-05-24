'use client';

import { Fragment } from 'react';
import { Check, Minus } from 'lucide-react';
import type { Permission, RoleDef } from '@/types/admin';
import { ADMIN_ACCENT } from './adminTheme';

interface Props {
  roles: RoleDef[];
  permissions: Permission[];
}

export function RoleMatrix({ roles, permissions }: Props) {
  const groups = Array.from(new Set(permissions.map((p) => p.group)));

  const th: React.CSSProperties = {
    padding: 'var(--space-3) var(--space-4)',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

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
              <th style={{ ...th, textAlign: 'left' }}>Разрешение</th>
              {roles.map((r) => (
                <th key={r.role} style={{ ...th, textAlign: 'center' }}>{r.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group}>
                <tr>
                  <td
                    colSpan={roles.length + 1}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: ADMIN_ACCENT,
                      background: 'color-mix(in srgb, var(--color-surface-hover) 60%, transparent)',
                      borderTop: '1px solid var(--color-border)',
                    }}
                  >
                    {group}
                  </td>
                </tr>
                {permissions.filter((p) => p.group === group).map((perm) => (
                  <tr key={perm.key}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', borderTop: '1px solid var(--color-border)' }}>
                      {perm.label}
                    </td>
                    {roles.map((r) => {
                      const has = r.permissions.includes(perm.key);
                      return (
                        <td key={r.role} style={{ textAlign: 'center', borderTop: '1px solid var(--color-border)' }}>
                          {has ? (
                            <Check size={16} color="var(--color-success)" style={{ display: 'inline' }} />
                          ) : (
                            <Minus size={16} color="var(--color-text-disabled)" style={{ display: 'inline' }} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RoleMatrix;
