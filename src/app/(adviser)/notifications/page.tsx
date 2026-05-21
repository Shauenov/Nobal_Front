'use client';

import { useState, type CSSProperties } from 'react';
import { Bell, CheckCheck, Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications';
import { useBroadcast } from '@/hooks/useMessages';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

/* ─── Styles ─── */
const tabBtn = (active: boolean): CSSProperties => ({
  padding: '8px 18px',
  borderRadius: 8,
  border: active ? 'none' : '1px solid #e2e8f0',
  background: active ? '#2563eb' : '#fff',
  color: active ? '#fff' : '#475569',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
});

const card: CSSProperties = {
  background: '#fff',
  border: '1px solid #e8ecf0',
  borderRadius: 12,
  padding: '14px 18px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 14,
  boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
};

const TYPE_ICONS: Record<string, string> = {
  task: '✅',
  appointment: '📅',
  message: '💬',
  system: '⚙️',
  admission: '🏫',
};

/* ─── Notifications list tab ─── */
function NotificationsList({ unreadOnly }: { unreadOnly: boolean }) {
  const { data, isLoading } = useNotifications({
    is_read: unreadOnly ? false : undefined,
    page: 1,
    page_size: 50,
  });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = data?.data ?? [];

  if (isLoading) {
    return <div style={{ color: '#94a3b8', padding: 24 }}>Загрузка...</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
        <Bell size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
        <div style={{ fontWeight: 600 }}>Нет уведомлений</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: '#fff', color: '#475569', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <CheckCheck size={14} />
          Отметить все прочитанными
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((n) => (
          <div
            key={n.id}
            style={{
              ...card,
              opacity: n.is_read ? 0.6 : 1,
              background: n.is_read ? '#f8fafc' : '#fff',
            }}
          >
            <div style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 2 }}>
              {TYPE_ICONS[n.type] ?? '🔔'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>{n.title}</div>
              {n.body && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 3 }}>{n.body}</div>
              )}
              <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: 5 }}>
                {format(new Date(n.created_at), 'd MMM yyyy, HH:mm', { locale: ru })}
              </div>
            </div>
            {!n.is_read && (
              <button
                type="button"
                onClick={() => markRead.mutate(n.id)}
                disabled={markRead.isPending}
                style={{
                  flexShrink: 0,
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#475569',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Прочитано
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Broadcast tab ─── */
function BroadcastPanel() {
  const [body, setBody] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('');
  const [ieltsFilter, setIeltsFilter] = useState<'any' | 'yes' | 'no'>('any');
  const broadcast = useBroadcast();

  const handleSend = () => {
    if (!body.trim()) return;
    broadcast.mutate({
      body,
      filter_group: filterGroup || null,
      ielts_passed: ieltsFilter === 'yes' ? true : ieltsFilter === 'no' ? false : null,
    });
    setBody('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
      <div style={{ fontSize: '0.875rem', color: '#475569' }}>
        Отправьте сообщение группе студентов. Используйте фильтры для выбора аудитории.
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {(['', 'D', 'D1', 'D2', 'F', 'F1', 'F2', 'F3', 'F4'] as const).map((g) => (
          <button
            key={g || 'all'}
            type="button"
            onClick={() => setFilterGroup(g)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              background: filterGroup === g ? '#2563eb' : '#fff',
              color: filterGroup === g ? '#fff' : '#475569',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {g === '' ? 'Все группы' : g}
          </button>
        ))}
        {(['any', 'yes', 'no'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setIeltsFilter(v)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              background: ieltsFilter === v ? '#7c3aed' : '#fff',
              color: ieltsFilter === v ? '#fff' : '#475569',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {v === 'any' ? 'IELTS: любой' : v === 'yes' ? 'IELTS: сдал' : 'IELTS: не сдал'}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Текст сообщения</label>
        <textarea
          rows={5}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: '0.875rem',
            resize: 'vertical',
            fontFamily: 'inherit',
            color: '#1e293b',
          }}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Введите текст рассылки..."
        />
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={!body.trim() || broadcast.isPending}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
          padding: '10px 20px', borderRadius: 8, border: 'none',
          background: '#2563eb', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
        }}
      >
        <Send size={15} />
        {broadcast.isPending ? 'Отправка…' : 'Отправить рассылку'}
      </button>
    </div>
  );
}

/* ─── Page ─── */
type Tab = 'all' | 'unread' | 'broadcast';

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>('all');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <PageHeader
        title="Уведомления"
        subtitle="Управляйте уведомлениями и рассылками"
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" style={tabBtn(tab === 'all')} onClick={() => setTab('all')}>
          Все уведомления
        </button>
        <button type="button" style={tabBtn(tab === 'unread')} onClick={() => setTab('unread')}>
          Непрочитанные
        </button>
        <button type="button" style={tabBtn(tab === 'broadcast')} onClick={() => setTab('broadcast')}>
          Рассылка
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e8ecf0',
          borderRadius: 14,
          padding: '20px 22px',
          boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
        }}
      >
        {tab === 'broadcast' ? (
          <BroadcastPanel />
        ) : (
          <NotificationsList unreadOnly={tab === 'unread'} />
        )}
      </div>
    </div>
  );
}
