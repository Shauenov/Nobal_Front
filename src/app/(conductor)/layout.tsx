import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ConductorShell } from '@/components/layout/ConductorShell';

interface ConductorLayoutProps {
  children: React.ReactNode;
}

export default function ConductorLayout({ children }: ConductorLayoutProps) {
  return (
    <ProtectedRoute>
      <ConductorShell>{children}</ConductorShell>
    </ProtectedRoute>
  );
}
