'use client';

import { useState, type CSSProperties } from 'react';
import { SlidersHorizontal, ScrollText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { SystemSettingsForm } from '@/components/admin/SystemSettingsForm';
import { AuditLogTable } from '@/components/admin/AuditLogTable';
import { MockBadge } from '@/components/admin/MockBadge';
import { ADMIN_ACCENT } from '@/components/admin/adminTheme';
import { useAuditLog } from '@/hooks/admin/useAdminSystem';

type Tab = 'settings' | 'audit';

export default function AdminSystemPage() {
  const [tab, setTab] = useState<Tab>('settings');
  const { data: audit, isLoading: auditLoading } = useAuditLog();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader title="Система" subtitle="Настройки платформы и журнал аудита" action={<MockBadge />} />

      <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
        <TabButton active={tab === 'settings'} onClick={() => setTab('settings')} icon={<SlidersHorizontal size={16} />} label="Настройки" />
        <TabButton active={tab === 'audit'} onClick={() => setTab('audit')} icon={<ScrollText size={16} />} label="Журнал аудита" />
      </div>

      {tab === 'settings' ? (
        <SystemSettingsForm />
      ) : auditLoading ? (
        <Skeleton style={{ height: 360, borderRadius: 12 }} />
      ) : (
        <AuditLogTable entries={audit ?? []} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    border: 'none',
    background: 'transparent',
    color: active ? ADMIN_ACCENT : 'var(--color-text-secondary)',
    fontWeight: active ? 600 : 500,
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    borderBottom: `2px solid ${active ? ADMIN_ACCENT : 'transparent'}`,
    marginBottom: -1,
  };
  return (
    <button onClick={onClick} style={style}>
      {icon}
      {label}
    </button>
  );
}
