'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import type { CSSProperties } from 'react';
import { useStudent } from '@/hooks/useStudents';
import { useUIStore } from '@/stores/uiStore';
import { formatGroup, formatCourseYear } from '@/lib/formatGroup';

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

  // Keep nav inside the current shell (adviser vs admin).
  const prefix = pathname?.startsWith('/admin') ? '/admin' : '';

  const studentName = student.data?.user.full_name ?? null;
  // Only override the breadcrumb on the overview tab where the UUID is the
  // last crumb. Sub-pages (profile, documents, …) already have a readable
  // segment as the last crumb so we leave pageTitle null for them.
  const isOverview = pathname === `${prefix}/students/${studentId}`;
  useEffect(() => {
    if (isOverview && studentName) setPageTitle(studentName);
    return () => setPageTitle(null);
  }, [isOverview, studentName, setPageTitle]);

  const tabs = [
    { label: 'Обзор', href: `${prefix}/students/${studentId}` },
    { label: 'Профиль', href: `${prefix}/students/${studentId}/profile` },
    { label: 'Документы', href: `${prefix}/students/${studentId}/documents` },
    { label: 'Задачи', href: `${prefix}/students/${studentId}/tasks` },
    { label: 'Маршруты', href: `${prefix}/students/${studentId}/roadmaps` },
  ];

  const name   = student.data?.user.full_name ?? 'Студент';
  const email  = student.data?.user.email ?? '—';
  const profile = student.data?.profile;
  const groupLabel = formatGroup(profile?.group_type, profile?.course_year);
  const yearLabel  = formatCourseYear(profile?.course_year);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div style={headerStyle}>
        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>
          {student.isLoading ? 'Загрузка...' : name}
        </div>
        <div style={metaStyle}>
          {email}
          {groupLabel && <> · Группа <strong style={{ color: 'var(--color-text-primary)' }}>{groupLabel}</strong></>}
          {yearLabel  && <> · {yearLabel}</>}
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
