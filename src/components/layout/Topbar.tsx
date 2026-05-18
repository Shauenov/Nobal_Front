'use client';

import { usePathname } from 'next/navigation';
import { Bell, ChevronRight, LogOut } from 'lucide-react';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

interface Crumb {
  label: string;
  href: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const formatSegment = (segment: string) => {
  if (UUID_RE.test(segment)) return '…'; // will be overridden by pageTitle
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const buildCrumbs = (pathname: string): Crumb[] => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return [{ label: 'Dashboard', href: '/dashboard' }];
  }

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    return { label: formatSegment(segment), href };
  });
};

const getInitials = (name?: string | null) => {
  if (!name) return 'CU';
  const parts = name.split(' ').filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase());
  return initials.join('') || 'CU';
};

export function Topbar() {
  const pathname = usePathname();
  const rawCrumbs = buildCrumbs(pathname);
  const { data: unread } = useUnreadNotificationCount();
  const { setNotificationDrawer, pageTitle } = useUIStore();

  // Replace the last crumb label with the page-level override when set
  const crumbs = pageTitle
    ? rawCrumbs.map((c, i) => (i === rawCrumbs.length - 1 ? { ...c, label: pageTitle } : c))
    : rawCrumbs;
  const { user } = useAuthStore();
  const logout = useLogout();

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-topbar)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-8)',
        gap: 'var(--space-4)',
      }}
    >
      <nav aria-label="Breadcrumbs" style={{ display: 'flex', alignItems: 'center' }}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <div
              key={crumb.href}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: isLast ? 'var(--font-semibold)' : 'var(--font-medium)',
                  color: isLast ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                }}
              >
                {crumb.label}
              </span>
              {!isLast && <ChevronRight size={14} color="var(--color-text-disabled)" />}
            </div>
          );
        })}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          aria-label="Notifications"
          onClick={() => setNotificationDrawer(true)}
          style={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-full)',
            padding: 0,
            minHeight: 40,
          }}
        >
          <Bell size={18} color="var(--color-text-secondary)" />
          {unread && unread.count > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: 'var(--color-error)',
                color: '#fff',
                borderRadius: 'var(--radius-full)',
                fontSize: '10px',
                fontWeight: 'var(--font-bold)',
                minWidth: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                border: '2px solid var(--color-surface)',
              }}
            >
              {Math.min(unread.count, 99)}
            </span>
          )}
        </Button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
            }}
          >
            {getInitials(user?.full_name)}
          </div>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.full_name ?? 'Conductor'}
          </span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => logout.mutate()}
          style={{
            color: 'var(--color-text-secondary)',
          }}
          leftIcon={<LogOut size={16} />}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}
