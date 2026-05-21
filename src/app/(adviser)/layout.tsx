import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ADVISERShell } from '@/components/layout/AdviserShell';

interface ADVISERLayoutProps {
  children: React.ReactNode;
}

export default function ADVISERLayout({ children }: ADVISERLayoutProps) {
  return (
    <ProtectedRoute>
      <ADVISERShell>{children}</ADVISERShell>
    </ProtectedRoute>
  );
}
