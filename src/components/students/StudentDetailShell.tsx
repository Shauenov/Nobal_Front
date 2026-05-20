'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import type { CSSProperties } from 'react';
import { useStudent } from '@/hooks/useStudents';
import { useUIStore } from '@/stores/uiStore';

interface StudentDetailShellProps {
  children: React.ReactNode;
}

const headerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const metaStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
};

const tabNavStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-3)',
  flexWrap: 'wrap',
  borderBottom: '1px solid var(--color-border)',
  paddingBottom: 'var(--space-2)',
};

const tabStyle = (active: boolean): CSSProperties => ({
  padding: '8px 12px',
  borderRadius: 'var(--radius-md)',
  color: active ? '#fff' : 'var(--color-text-secondary)',
  background: active ? 'var(--color-primary)' : 'transparent',
  fontSize: 'var(--text-sm)',
  fontWeight: active ? 'var(--font-semibold)' : 'var(--font-medium)',
  textDecoration: 'none',
});

const getStudentId = (value: string | string[] | undefined) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? '';
  return '';
};

export function StudentDetailShell({ children }: StudentDetailShellProps) {
  const params = useParams();
  const pathname = usePathname();
  const studentId = getStudentId(params.studentId);
  const student = useStudent(studentId);
  const { setPageTitle } = useUIStore();

  const studentName = student.data?.user.full_name ?? null;
  // Only override the breadcrumb on the overview tab where the UUID is the
  // last crumb. Sub-pages (profile, documents, …) already have a readable
  // segment as the last crumb so we leave pageTitle null for them.
  const isOverview = pathname === `/students/${studentId}`;
  useEffect(() => {
    if (isOverview && studentName) setPageTitle(studentName);
    return () => setPageTitle(null);
  }, [isOverview, studentName, setPageTitle]);

  const tabs = [
    { label: 'Обзор', href: `/students/${studentId}` },
    { label: 'Профиль', href: `/students/${studentId}/profile` },
    { label: 'Документы', href: `/students/${studentId}/documents` },
    { label: 'Задачи', href: `/students/${studentId}/tasks` },
    { label: 'Маршруты', href: `/students/${studentId}/roadmaps` },
  ];

  const name = student.data?.user.full_name ?? 'Студент';
  const email = student.data?.user.email ?? '—';
  const group = student.data?.profile?.group_type ?? '—';
  const year = student.data?.profile?.course_year ?? '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div style={headerStyle}>
        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>
          {student.isLoading ? 'Загрузка...' : name}
        </div>
        <div style={metaStyle}>
          {email} · Группа {group} · {year}-й курс
        </div>
      </div>

      <nav style={tabNavStyle} aria-label="Student tabs">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} style={tabStyle(active)}>
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
