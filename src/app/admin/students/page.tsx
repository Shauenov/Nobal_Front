// Reuses the existing adviser screen (real data + admin-only delete) inside the
// AdminShell. Drill-down links open detail pages in the adviser route group.
import AdviserStudentsPage from '@/app/(adviser)/students/page';

export default function AdminPage() {
  return <AdviserStudentsPage />;
}
