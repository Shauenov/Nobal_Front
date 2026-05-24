'use client';

import { GraduationCap, ShieldCheck, KeyRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { RoleMatrix } from '@/components/admin/RoleMatrix';
import { MockBadge } from '@/components/admin/MockBadge';
import { cardStyle, sectionTitleStyle, ADMIN_ACCENT } from '@/components/admin/adminTheme';
import { useAdminRoles, useAdminPermissions } from '@/hooks/admin/useAdminRoles';
import type { Role } from '@/types/admin';

const ROLE_ICON: Record<Role, LucideIcon> = {
  student: GraduationCap,
  adviser: ShieldCheck,
  admin: KeyRound,
};
const ROLE_COLOR: Record<Role, string> = {
  student: '#2563eb',
  adviser: '#0ea5e9',
  admin: ADMIN_ACCENT,
};

export default function AdminRolesPage() {
  const { data: roles, isLoading } = useAdminRoles();
  const { data: permissions } = useAdminPermissions();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader title="Роли и доступы" subtitle="Матрица разрешений по ролям системы" action={<MockBadge />} />

      {/* Role cards */}
      {isLoading || !roles ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} style={{ height: 150, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
          {roles.map((r) => {
            const Icon = ROLE_ICON[r.role];
            const color = ROLE_COLOR[r.role];
            return (
              <div key={r.role} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `color-mix(in srgb, ${color} 12%, transparent)`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} />
                  </span>
                  <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{r.userCount}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{r.label}</div>
                  <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{r.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Matrix */}
      <div>
        <h2 style={{ ...sectionTitleStyle, marginBottom: 'var(--space-4)' }}>Матрица разрешений</h2>
        {roles && permissions ? (
          <RoleMatrix roles={roles} permissions={permissions} />
        ) : (
          <Skeleton style={{ height: 280, borderRadius: 12 }} />
        )}
      </div>
    </div>
  );
}
