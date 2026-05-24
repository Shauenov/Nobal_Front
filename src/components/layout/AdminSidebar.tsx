'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  KeyRound,
  Server,
  GraduationCap,
  Building2,
  MessageSquare,
  CalendarClock,
  Calendar,
  Newspaper,
  Map,
  HelpCircle,
  Award,
  BarChart3,
  Bell,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useLogout } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
}

// Admin accent — deliberately distinct from the adviser blue so the panel
// is instantly recognisable. Base palette still comes from design tokens.
const ADMIN_ACCENT = '#7c3aed';
const ADMIN_ACCENT_2 = '#6d28d9';

const manageNav: NavItem[] = [
  { label: 'Дашборд', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Пользователи', href: '/admin/users', icon: Users },
  { label: 'Кураторы', href: '/admin/advisers', icon: ShieldCheck },
  { label: 'Роли и доступы', href: '/admin/roles', icon: KeyRound },
  { label: 'Система', href: '/admin/system', icon: Server },
];

const operationalNav: NavItem[] = [
  { label: 'Студенты', href: '/admin/students', icon: GraduationCap },
  { label: 'Вузы', href: '/admin/universities', icon: Building2 },
  { label: 'Сообщения', href: '/admin/messages', icon: MessageSquare },
  { label: 'Записи', href: '/admin/appointments', icon: CalendarClock },
  { label: 'Календарь', href: '/admin/calendar', icon: Calendar },
  { label: 'Новости', href: '/admin/news', icon: Newspaper },
  { label: 'Маршруты', href: '/admin/roadmaps', icon: Map },
  { label: 'FAQ', href: '/admin/faq', icon: HelpCircle },
  { label: 'Выпускники', href: '/admin/alumni', icon: Award },
  { label: 'Отчёты', href: '/admin/reports', icon: BarChart3 },
  { label: 'Уведомления', href: '/admin/notifications', icon: Bell },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed } = useUIStore();
  const { data: unreadData } = useUnreadNotificationCount();
  const logout = useLogout();

  const isActive = (href: string) =>
    href === '/admin/dashboard' ? pathname === href : pathname.startsWith(href);

  const linkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: sidebarCollapsed ? '10px 0' : '10px 16px',
    margin: '1px 8px',
    borderRadius: 8,
    background: active ? `linear-gradient(135deg, ${ADMIN_ACCENT} 0%, ${ADMIN_ACCENT_2} 100%)` : 'transparent',
    color: active ? '#fff' : 'rgba(255,255,255,0.55)',
    transition: 'all 150ms ease',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
    position: 'relative',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    cursor: 'pointer',
    border: 'none',
    boxShadow: active ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
  });

  const sectionLabel = (text: string) =>
    !sidebarCollapsed ? (
      <div
        style={{
          padding: '12px 24px 6px',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
        }}
      >
        {text}
      </div>
    ) : (
      <div style={{ margin: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }} />
    );

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    const showBadge =
      (item.href === '/admin/messages' || item.href === '/admin/notifications') &&
      unreadData &&
      unreadData.count > 0;
    return (
      <Link
        key={item.href}
        href={item.href}
        title={sidebarCollapsed ? item.label : undefined}
        style={linkStyle(active)}
      >
        <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}>
          <Icon size={18} />
        </span>
        {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
        {showBadge && (
          <span
            style={{
              background: '#ef4444',
              color: '#fff',
              borderRadius: 9999,
              fontSize: '10px',
              fontWeight: 700,
              minWidth: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {Math.min(unreadData!.count, 99)}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      style={{
        width: sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        transition: 'width var(--transition-base)',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 'var(--z-sidebar)' as React.CSSProperties['zIndex'],
        background: '#0f1724',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: `1px solid rgba(124,58,237,0.15)`,
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${ADMIN_ACCENT} 0%, ${ADMIN_ACCENT_2} 100%)`,
          flexShrink: 0,
        }}
      />

      {/* Logo + ADMIN badge */}
      <div
        style={{
          height: 'calc(var(--topbar-height) - 3px)',
          display: 'flex',
          alignItems: 'center',
          padding: sidebarCollapsed ? '0' : '0 20px',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${ADMIN_ACCENT} 0%, ${ADMIN_ACCENT_2} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontWeight: 700,
            color: '#fff',
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
          }}
        >
          N
        </div>
        {!sidebarCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', letterSpacing: '-0.01em' }}>
              Nobal Education
            </span>
            <span
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: ADMIN_ACCENT,
                background: 'rgba(124,58,237,0.15)',
                padding: '1px 6px',
                borderRadius: 4,
                width: 'fit-content',
              }}
            >
              ADMIN PANEL
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 0 12px' }}>
        {sectionLabel('Управление')}
        {manageNav.map(renderItem)}
        {sectionLabel('Операционные')}
        {operationalNav.map(renderItem)}
      </nav>

      {/* Bottom: Logout */}
      <div style={{ padding: '8px 0 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => logout.mutate()}
          title={sidebarCollapsed ? 'Выйти' : undefined}
          style={{
            ...linkStyle(false),
            width: '100%',
            background: 'transparent',
            textAlign: 'left',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          <span style={{ flexShrink: 0, opacity: 0.7 }}>
            <LogOut size={18} />
          </span>
          {!sidebarCollapsed && <span>Выйти</span>}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
