'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { NotificationDrawer } from './NotificationDrawer';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useUIStore } from '@/stores/uiStore';

interface ADVISERShellProps {
  children: React.ReactNode;
}

export function ADVISERShell({ children }: ADVISERShellProps) {
  const { sidebarCollapsed } = useUIStore();
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(true);
    const t = setTimeout(() => setNavigating(false), 400);
    return () => clearTimeout(t);
  }, [pathname]);
  const sidebarWidth = sidebarCollapsed
    ? 'var(--sidebar-collapsed)'
    : 'var(--sidebar-width)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <LoadingOverlay visible={navigating} />
      <Sidebar />
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
