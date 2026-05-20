'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  MessageSquare,
  CalendarDays,
  Newspaper,
  Settings,
  LogOut,
  Map,
  HelpCircle,
  Award,
  Bell,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useLogout } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
}

const mainNav: NavItem[] = [
  { label: 'Панель Управления', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Студенты', href: '/students', icon: Users },
  { label: 'Каталог вузов', href: '/universities', icon: GraduationCap },
  { label: 'Личные сообщения', href: '/messages', icon: MessageSquare },
  { label: 'Записи', href: '/appointments', icon: CalendarDays },
  { label: 'Новости', href: '/news', icon: Newspaper },
];

const contentNav: NavItem[] = [
  { label: 'Маршруты', href: '/roadmaps', icon: Map },
  { label: 'FAQ', href: '/faq', icon: HelpCircle },
  { label: 'Выпускники', href: '/alumni', icon: Award },
  { label: 'Уведомления', href: '/notifications', icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed } = useUIStore();
  const { data: unreadData } = useUnreadNotificationCount();
  const logout = useLogout();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const linkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: sidebarCollapsed ? '10px 0' : '10px 16px',
    margin: '1px 8px',
    borderRadius: 8,
    background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
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
  });

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
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 'var(--topbar-height)',
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
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontWeight: 700,
            color: '#fff',
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
          }}
        >
          N
        </div>
        {!sidebarCollapsed && (
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#fff',
              letterSpacing: '-0.01em',
            }}
          >
            Nobal Education
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px 0',
        }}
      >
        {mainNav.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
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
              {!sidebarCollapsed && (
                <span style={{ flex: 1 }}>{item.label}</span>
              )}
              {/* Unread badge for messages */}
              {item.href === '/messages' && unreadData && unreadData.count > 0 && (
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
                  {Math.min(unreadData.count, 99)}
                </span>
              )}
            </Link>
          );
        })}

        {/* Separator */}
        <div
          style={{
            margin: '10px 16px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        />

        {contentNav.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
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
              {!sidebarCollapsed && (
                <span style={{ flex: 1 }}>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div
        style={{
          padding: '8px 0 12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Link
          href="/settings"
          title={sidebarCollapsed ? 'Настройки' : undefined}
          style={linkStyle(pathname.startsWith('/settings'))}
        >
          <span style={{ flexShrink: 0, opacity: pathname.startsWith('/settings') ? 1 : 0.7 }}>
            <Settings size={18} />
          </span>
          {!sidebarCollapsed && <span>Настройки</span>}
        </Link>

        <button
          onClick={() => logout.mutate()}
          title={sidebarCollapsed ? 'Выйти' : undefined}
          style={{
            ...linkStyle(false),
            width: '100%',
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
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
