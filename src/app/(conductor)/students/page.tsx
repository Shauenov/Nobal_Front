'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StudentFilters } from '@/components/students/StudentFilters';
import { StudentGrid } from '@/components/students/StudentGrid';
import { InviteModal } from '@/components/students/InviteModal';
import { useDeleteStudent, useStudents } from '@/hooks/useStudents';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

const parseBoolean = (value: string | null) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const toInt = (value: string | null) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default function StudentsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deleteStudent = useDeleteStudent();
  const t = useTranslations('students');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchText, setSearchText] = useState(searchParams.get('search') ?? '');

  const groupType = searchParams.get('group_type') ?? '';
  const courseYear = searchParams.get('course_year') ?? '';
  const ieltsPassed = searchParams.get('ielts_passed') ?? '';
  const satPassed = searchParams.get('sat_passed') ?? '';
  const page = toInt(searchParams.get('page')) ?? 1;

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchText) {
        params.set('search', searchText);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, pathname, router, searchParams]);

  const queryParams = useMemo(
    () => ({
      group_type: groupType === 'D' || groupType === 'F' ? (groupType as 'D' | 'F') : undefined,
      course_year:
        courseYear && (Number(courseYear) === 2 || Number(courseYear) === 3)
          ? (Number(courseYear) as 2 | 3)
          : undefined,
      ielts_passed: parseBoolean(ieltsPassed),
      sat_passed: parseBoolean(satPassed),
      search: searchText || undefined,
      page,
      page_size: 20,
    }),
    [groupType, courseYear, ieltsPassed, satPassed, searchText, page]
  );

  const students = useStudents(queryParams);
  const items = students.data?.data ?? [];
  const meta = students.data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.page_size)) : 1;

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('deleteConfirm'))) {
      deleteStudent.mutate(id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <StudentFilters
        groupType={groupType}
        courseYear={courseYear}
        ieltsPassed={ieltsPassed}
        satPassed={satPassed}
        search={searchText}
        onFilterChange={setParam}
        onSearchChange={setSearchText}
        onInvite={() => setInviteOpen(true)}
      />

      <Card padding="md">
        {students.isLoading ? (
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <Skeleton style={{ height: 20, width: '40%' }} />
            <Skeleton style={{ height: 56, width: '100%' }} />
            <Skeleton style={{ height: 56, width: '100%' }} />
            <Skeleton style={{ height: 56, width: '100%' }} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title={t('empty.title')}
            description={t('empty.description')}
            icon={<Users size={24} />}
            actionLabel={t('empty.action')}
            onAction={() => setInviteOpen(true)}
          />
        ) : (
          <StudentGrid students={items} onDelete={handleDelete} />
        )}
      </Card>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span>
          {t('pagination.pageOf', { page: meta?.page ?? 1, total: totalPages })}
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            {t('pagination.previous')}
          </button>
          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              opacity: page >= totalPages ? 0.5 : 1,
            }}
          >
            {t('pagination.next')}
          </button>
        </div>
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
