'use client';

import { AdminSidebar } from './AdminSidebar';
import { Topbar } from './Topbar';
import { NotificationDrawer } from './NotificationDrawer';
import { useUIStore } from '@/stores/uiStore';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { sidebarCollapsed } = useUIStore();

  const sidebarWidth = sidebarCollapsed
    ? 'var(--sidebar-collapsed)'
    : 'var(--sidebar-width)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <AdminSidebar />
      <div
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left var(--transition-base)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-bg)',
        }}
      >
        <Topbar />
        <main style={{ flex: 1, padding: 'var(--space-8)' }}>{children}</main>
      </div>
      <NotificationDrawer />
    </div>
  );
}

export default AdminShell;
