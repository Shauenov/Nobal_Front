import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminShell } from '@/components/layout/AdminShell';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute roles={['admin']}>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
