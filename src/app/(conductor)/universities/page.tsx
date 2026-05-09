'use client';

import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useUniversities, useUpdateUniversity, useDeleteUniversity } from '@/hooks/useUniversities';
import { PageHeader } from '@/components/layout/PageHeader';
import { UniversityCard } from '@/components/universities/UniversityCard';
import { UniversityFilters } from '@/components/universities/UniversityFilters';
import type { UniversityListParams } from '@/types/api';

const layoutStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-6)',
};

const sidebarStyle: CSSProperties = {
  width: '280px',
  flexShrink: 0,
};

const mainStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const headerActionsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 'var(--space-4)',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  gap: 'var(--space-4)',
};

const buttonStyle: CSSProperties = {
  padding: '10px 16px',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  cursor: 'pointer',
  border: 'none',
  background: 'var(--color-primary)',
  color: '#fff',
};

const emptyStateStyle: CSSProperties = {
  textAlign: 'center',
  padding: 'var(--space-8)',
  color: 'var(--color-text-secondary)',
};

const paginationStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 'var(--space-2)',
  marginTop: 'var(--space-6)',
};

const pageButtonStyle = (isActive: boolean, disabled?: boolean): CSSProperties => ({
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  border: isActive ? 'none' : '1px solid var(--color-border)',
  background: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
  color: isActive ? '#fff' : 'var(--color-text-primary)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: 'var(--text-sm)',
  opacity: disabled ? 0.5 : 1,
});

export default function UniversitiesPage() {
  const [params, setParams] = useState<UniversityListParams>({ page: 1, page_size: 10 });

  const { data: response, isLoading } = useUniversities(params);
  const updateUniversity = useUpdateUniversity('');
  const deleteUniversity = useDeleteUniversity();

  const universities = useMemo(() => response?.data ?? [], [response?.data]);
  const meta = useMemo(() => response?.meta, [response?.meta]);

  const handleParamsChange = (newParams: UniversityListParams) => {
    setParams(newParams);
  };

  const handleTogglePublished = (universityId: string, isPublished: boolean) => {
    const university = universities.find((u) => u.id === universityId);
    if (university) {
      updateUniversity.mutate({ is_published: isPublished });
    }
  };

  const handleDeleteUniversity = (universityId: string) => {
    if (confirm('Are you sure you want to delete this university?')) {
      deleteUniversity.mutate(universityId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <PageHeader title="Universities" subtitle="Manage university profiles and programs." />

      <div style={headerActionsStyle}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          {meta ? `${meta.total} universities` : 'Loading...'}
        </div>
        <Link href="/universities/new" style={{ textDecoration: 'none' }}>
          <button style={buttonStyle}>+ New University</button>
        </Link>
      </div>

      <div style={layoutStyle}>
        <div style={sidebarStyle}>
          <UniversityFilters params={params} onParamsChange={handleParamsChange} />
        </div>

        <div style={mainStyle}>
          {isLoading ? (
            <div style={emptyStateStyle}>Loading universities...</div>
          ) : universities.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                No universities found
              </div>
              <div>Try adjusting your filters or create a new university.</div>
            </div>
          ) : (
            <>
              <div style={gridStyle}>
                {universities.map((university) => (
                  <UniversityCard
                    key={university.id}
                    university={university}
                    onTogglePublished={(isPublished) => handleTogglePublished(university.id, isPublished)}
                    onDelete={() => handleDeleteUniversity(university.id)}
                    isLoading={deleteUniversity.isPending}
                  />
                ))}
              </div>

              {meta && meta.total > meta.page_size && (
                <div style={paginationStyle}>
                  <button
                    style={pageButtonStyle(false, (meta.page || 1) <= 1)}
                    onClick={() => setParams({ ...params, page: Math.max(1, (meta.page || 1) - 1) })}
                    disabled={(meta.page || 1) <= 1}
                  >
                    ← Previous
                  </button>

                  {Array.from({ length: Math.ceil(meta.total / meta.page_size) })
                    .slice(Math.max(0, (meta.page || 1) - 2), Math.min((meta.page || 1) + 2, Math.ceil(meta.total / meta.page_size)))
                    .map((_, i) => {
                      const pageNum = (meta.page || 1) - 2 + i;
                      return (
                        <button
                          key={pageNum}
                          style={pageButtonStyle(pageNum === (meta.page || 1))}
                          onClick={() => setParams({ ...params, page: pageNum })}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                  <button
                    style={pageButtonStyle(false, (meta.page || 1) >= Math.ceil(meta.total / meta.page_size))}
                    onClick={() => setParams({ ...params, page: (meta.page || 1) + 1 })}
                    disabled={(meta.page || 1) >= Math.ceil(meta.total / meta.page_size)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
