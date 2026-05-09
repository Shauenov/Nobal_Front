'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  MessageSquare,
  GraduationCap,
  Map,
  Newspaper,
  CalendarDays,
  HelpCircle,
  Award,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
  section?: string;
}

const navItems: NavItem[] = [
  // Main
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'main' },
  { label: 'Students', href: '/students', icon: Users, section: 'main' },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare, section: 'main' },
  { label: 'Appointments', href: '/appointments', icon: Calendar, section: 'main' },
  { label: 'Messages', href: '/messages', icon: MessageSquare, section: 'main' },
  // Content
  { label: 'Universities', href: '/universities', icon: GraduationCap, section: 'content' },
  { label: 'Roadmaps', href: '/roadmaps', icon: Map, section: 'content' },
  { label: 'News', href: '/news', icon: Newspaper, section: 'content' },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays, section: 'content' },
  { label: 'Alumni', href: '/alumni', icon: Award, section: 'content' },
  { label: 'FAQ', href: '/faq', icon: HelpCircle, section: 'content' },
  // Analytics
  { label: 'Reports', href: '/reports', icon: BarChart3, section: 'analytics' },
  // Settings
  { label: 'Settings', href: '/settings', icon: Settings, section: 'settings' },
];

const SECTIONS = [
  { id: 'main', label: 'Workspace' },
  { id: 'content', label: 'Content' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'System' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { data: unreadData } = useUnreadNotificationCount();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className="sidebar"
      style={{
        width: sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        transition: 'width var(--transition-base)',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 'var(--z-sidebar)',
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
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
          padding: '0 var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        <div className="gradient-primary"
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontWeight: 'var(--font-bold)',
            color: '#fff',
            fontSize: 'var(--text-sm)',
          }}
        >
          N
        </div>
        {!sidebarCollapsed && (
          <span
            style={{
              marginLeft: 'var(--space-3)',
              fontWeight: 'var(--font-semibold)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            EduConductor
          </span>
        )}
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 'var(--space-3) 0',
        }}
      >
        {SECTIONS.map((section) => {
          const items = navItems.filter((n) => n.section === section.id);
          return (
            <div key={section.id} style={{ marginBottom: 'var(--space-2)' }}>
              {!sidebarCollapsed && (
                <div
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-disabled)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {section.label}
                </div>
              )}
              {items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: sidebarCollapsed
                        ? 'var(--space-3) 0'
                        : 'var(--space-2) var(--space-4)',
                      margin: '2px var(--space-2)',
                      borderRadius: 'var(--radius-md)',
                      background: active ? 'var(--color-primary)' : 'transparent',
                      color: active
                        ? '#fff'
                        : 'var(--color-text-secondary)',
                      transition: 'all var(--transition-fast)',
                      textDecoration: 'none',
                      fontSize: 'var(--text-sm)',
                      fontWeight: active ? 'var(--font-semibold)' : 'var(--font-normal)',
                      position: 'relative',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      boxShadow: active ? 'var(--shadow-glow)' : 'none',
                    }}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    {!sidebarCollapsed && (
                      <span style={{ whiteSpace: 'nowrap', flex: 1 }}>
                        {item.label}
                      </span>
                    )}
                    {/* Unread badge for messages */}
                    {item.href === '/messages' && unreadData && unreadData.count > 0 && (
                      <span
                        style={{
                          background: active ? 'rgba(255,255,255,0.3)' : 'var(--color-error)',
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
                        }}
                      >
                        {Math.min(unreadData.count, 99)}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Collapse button */}
      <button
        onClick={toggleSidebar}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'var(--space-3)',
          padding: 'var(--space-2)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface-hover)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          fontSize: 'var(--text-sm)',
          gap: 'var(--space-2)',
        }}
      >
        {sidebarCollapsed ? (
          <ChevronRight size={16} />
        ) : (
          <>
            <ChevronLeft size={16} />
            <span>Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
}
