import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdviserShell } from '@/components/layout/AdviserShell';

interface AdviserLayoutProps {
  children: React.ReactNode;
}

export default function AdviserLayout({ children }: AdviserLayoutProps) {
  // Admin is also permitted here so admins can follow drill-down links
  // (e.g. /students/[id]) into detail pages. Adviser behaviour is unchanged.
  return (
    <ProtectedRoute roles={['adviser', 'admin']}>
      <AdviserShell>{children}</AdviserShell>
    </ProtectedRoute>
  );
}
