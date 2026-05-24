// Re-uses the same student detail shell (tabs) as the adviser route.
// AdminShell is provided by /admin/layout.tsx wrapping the entire admin group.
import { StudentDetailShell } from '@/components/students/StudentDetailShell';

export default function AdminStudentDetailLayout({ children }: { children: React.ReactNode }) {
  return <StudentDetailShell>{children}</StudentDetailShell>;
}
