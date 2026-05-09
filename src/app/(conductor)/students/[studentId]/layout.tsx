import { StudentDetailShell } from '@/components/students/StudentDetailShell';

interface StudentDetailLayoutProps {
  children: React.ReactNode;
}

export default function StudentDetailLayout({ children }: StudentDetailLayoutProps) {
  return <StudentDetailShell>{children}</StudentDetailShell>;
}
