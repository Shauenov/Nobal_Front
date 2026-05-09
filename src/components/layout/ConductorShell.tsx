'use client';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useUIStore } from '@/stores/uiStore';

interface ConductorShellProps {
  children: React.ReactNode;
}

export function ConductorShell({ children }: ConductorShellProps) {
  const { sidebarCollapsed } = useUIStore();
  const sidebarWidth = sidebarCollapsed
    ? 'var(--sidebar-collapsed)'
    : 'var(--sidebar-width)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <div
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left var(--transition-base)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Topbar />
        <main style={{ flex: 1, padding: 'var(--space-6)' }}>{children}</main>
      </div>
    </div>
  );
}
