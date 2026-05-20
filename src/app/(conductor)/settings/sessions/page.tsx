'use client';

import type { CSSProperties } from 'react';
import { Monitor, Smartphone, Globe, LogOut, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useSessions, useRevokeSession, useRevokeAllSessions } from '@/hooks/useSessions';
import type { SessionOut } from '@/types/api';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

/* ─── Helpers ─── */
function guessDeviceIcon(deviceName: string | null) {
  const name = (deviceName ?? '').toLowerCase();
  if (name.includes('mobile') || name.includes('android') || name.includes('iphone')) {
    return <Smartphone size={18} />;
  }
  if (name.includes('mozilla') || name.includes('chrome') || name.includes('safari') || name.includes('firefox')) {
    return <Monitor size={18} />;
  }
  return <Globe size={18} />;
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Неизвестное устройство';
  if (ua.includes('Chrome')) return 'Google Chrome';
  if (ua.includes('Firefox')) return 'Mozilla Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edge')) return 'Microsoft Edge';
  if (ua.includes('Mobile')) return 'Мобильное устройство';
  return ua.slice(0, 60);
}

/* ─── Styles ─── */
const cardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e8ecf0',
  borderRadius: 12,
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
};

/* ─── Session card ─── */
function SessionCard({
  session,
  isFirst,
  onRevoke,
  isRevoking,
}: {
  session: SessionOut;
  isFirst: boolean;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
}) {
  const deviceLabel = parseUserAgent(session.device_name);
  const icon = guessDeviceIcon(session.device_name);

  return (
    <div style={{ ...cardStyle, background: isFirst ? '#f0f9ff' : '#fff', borderColor: isFirst ? '#bfdbfe' : '#e8ecf0' }}>
      {/* Icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: isFirst ? '#dbeafe' : 'var(--color-surface-hover)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isFirst ? '#2563eb' : '#64748b', flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>{deviceLabel}</span>
          {isFirst && (
            <span style={{
              padding: '1px 8px', borderRadius: 9999,
              background: '#dbeafe', color: '#1d4ed8',
              fontSize: '0.7rem', fontWeight: 700,
            }}>
              Текущая
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3 }}>
          {session.ip_address && <span>IP: {session.ip_address} · </span>}
          Последняя активность: {formatDistanceToNow(new Date(session.last_used_at), { addSuffix: true, locale: ru })}
        </div>
        <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: 2 }}>
          Создан: {format(new Date(session.created_at), 'd MMM yyyy, HH:mm', { locale: ru })} ·{' '}
          Истекает: {format(new Date(session.expires_at), 'd MMM yyyy', { locale: ru })}
        </div>
      </div>

      {/* Revoke button — not shown for current session */}
      {!isFirst && (
        <button
          type="button"
          disabled={isRevoking}
          onClick={() => onRevoke(session.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '7px 14px', borderRadius: 8,
            border: '1px solid #fecaca', background: '#fff',
            color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            opacity: isRevoking ? 0.6 : 1,
          }}
        >
          <LogOut size={13} /> Выйти
        </button>
      )}
    </div>
  );
}

/* ─── Page ─── */
export default function SessionsPage() {
  const { data: sessions, isLoading } = useSessions();
  const revoke = useRevokeSession();
  const revokeAll = useRevokeAllSessions();

  const items = sessions ?? [];
  const otherCount = Math.max(0, items.length - 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <PageHeader
        title="Активные сеансы"
        subtitle="Управляйте устройствами, на которых выполнен вход"
        action={
          otherCount > 0 ? (
            <button
              type="button"
              disabled={revokeAll.isPending}
              onClick={() => {
                if (confirm(`Выйти из ${otherCount} других устройств?`)) {
                  revokeAll.mutate();
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 8,
                border: '1px solid #fecaca', background: '#fff',
                color: '#dc2626', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                opacity: revokeAll.isPending ? 0.6 : 1,
              }}
            >
              <ShieldAlert size={14} />
              {revokeAll.isPending ? 'Выход...' : `Выйти из всех других устройств (${otherCount})`}
            </button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div style={{ color: 'var(--color-text-secondary)', padding: 24 }}>Загрузка сеансов...</div>
      ) : items.length === 0 ? (
        <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 48 }}>
          Нет активных сеансов
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              isFirst={index === 0}
              onRevoke={(id) => revoke.mutate(id)}
              isRevoking={revoke.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
