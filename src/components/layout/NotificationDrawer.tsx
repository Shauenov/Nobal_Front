'use client';

import { X, Check, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { useUIStore } from '@/stores/uiStore';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export function NotificationDrawer() {
  const { notificationDrawerOpen, setNotificationDrawer } = useUIStore();
  const { data: notificationsData } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsRead();

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!notificationDrawerOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 'calc(var(--z-topbar) + 1)',
        }}
        onClick={() => setNotificationDrawer(false)}
      />

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: 400,
          height: '100vh',
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 'calc(var(--z-topbar) + 2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', margin: 0 }}>
              Уведомления
            </h2>
            {unreadCount > 0 && (
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  margin: '4px 0 0 0',
                }}
              >
                {unreadCount} новых
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setNotificationDrawer(false)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {unreadCount > 0 && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-6)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              gap: 'var(--space-2)',
            }}
          >
            <button
              type="button"
              onClick={() => markAllAsRead()}
              style={{
                flex: 1,
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <CheckCheck size={14} style={{ marginRight: 'var(--space-1)' }} />
              Отметить все
            </button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {notifications.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                flex: 1,
                padding: 'var(--space-8)',
                color: 'var(--color-text-secondary)',
                textAlign: 'center',
              }}
            >
              <Check size={40} strokeWidth={1.5} />
              <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
                У вас нет уведомлений
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: 'var(--space-4) var(--space-6)',
                  borderBottom: '1px solid var(--color-border)',
                  background: notification.is_read ? 'transparent' : 'rgba(0,0,0,0.03)',
                  cursor: notification.is_read ? 'default' : 'pointer',
                }}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 'var(--radius-full)',
                      background: notification.is_read ? 'transparent' : 'var(--color-primary)',
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: notification.is_read ? 'var(--font-medium)' : 'var(--font-semibold)', margin: '0 0 var(--space-1) 0', color: 'var(--color-text-primary)' }}>
                      {notification.title}
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-2) 0', lineHeight: 1.4 }}>
                      {notification.body}
                    </p>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-disabled)' }}>
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ru })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default NotificationDrawer;
