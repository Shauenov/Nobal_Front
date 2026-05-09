'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useParams } from 'next/navigation';
import { useUniversity, useUpdateUniversity, useCreateProgram, useDeleteProgram } from '@/hooks/useUniversities';
import { PageHeader } from '@/components/layout/PageHeader';
import { UniversityForm } from '@/components/universities/UniversityForm';
import type { UniversityCreate } from '@/types/api';

const layoutStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-6)',
};

const tabsStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-2)',
  borderBottom: '1px solid var(--color-border)',
};

const tabButtonStyle = (isActive: boolean): CSSProperties => ({
  padding: '12px 16px',
  borderRadius: '4px 4px 0 0',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  cursor: 'pointer',
  border: 'none',
  background: isActive ? 'var(--color-primary)' : 'transparent',
  color: isActive ? '#fff' : 'var(--color-text-secondary)',
  borderBottom: isActive ? 'none' : '2px solid transparent',
});

const containerStyle: CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  padding: 'var(--space-6)',
};

const programsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 'var(--space-4)',
};

const programCardStyle: CSSProperties = {
  background: 'var(--color-surface-hover)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const programNameStyle: CSSProperties = {
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-primary)',
};

const programDetailStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
};

const buttonStyle = (variant: 'primary' | 'ghost' = 'ghost', disabled?: boolean): CSSProperties => ({
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  border: variant === 'primary' ? 'none' : '1px solid var(--color-border)',
  background: variant === 'primary' ? 'var(--color-primary)' : 'transparent',
  color: variant === 'primary' ? '#fff' : 'var(--color-text-primary)',
  opacity: disabled ? 0.6 : 1,
});

export default function UniversityDetailPage() {
  const params = useParams();
  const universityId = params.universityId as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'programs'>('overview');

  const { data: universityDetail, isLoading } = useUniversity(universityId);
  const updateUniversity = useUpdateUniversity(universityId);
  const createProgram = useCreateProgram(universityId);
  const deleteProgram = useDeleteProgram(universityId);

  const university = useMemo(() => universityDetail?.university, [universityDetail?.university]);
  const programs = useMemo(() => universityDetail?.programs ?? [], [universityDetail?.programs]);

  const handleUpdateUniversity = useCallback(
    async (data: UniversityCreate) => {
      try {
        await updateUniversity.mutateAsync(data);
      } catch (error) {
        console.error(error);
      }
    },
    [updateUniversity]
  );

  const handleCreateProgram = useCallback(async () => {
    const name = prompt('Program name:');
    if (!name) return;

    try {
      await createProgram.mutateAsync({
        name,
        is_active: true,
      });
    } catch (error) {
      console.error(error);
    }
  }, [createProgram]);

  const handleDeleteProgram = useCallback(
    (programId: string) => {
      if (confirm('Delete this program?')) {
        deleteProgram.mutate(programId);
      }
    },
    [deleteProgram]
  );

  if (isLoading || !university) {
    return <div>Loading...</div>;
  }

  return (
    <div style={layoutStyle}>
      <PageHeader
        title={university.name}
        subtitle={`${university.city ? university.city + ', ' : ''}${university.country}`}
      />

      <div style={tabsStyle}>
        <button
          style={tabButtonStyle(activeTab === 'overview')}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          style={tabButtonStyle(activeTab === 'programs')}
          onClick={() => setActiveTab('programs')}
        >
          Programs ({programs.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div style={containerStyle}>
          <UniversityForm
            university={university}
            onSubmit={handleUpdateUniversity}
            isLoading={updateUniversity.isPending}
          />
        </div>
      )}

      {activeTab === 'programs' && (
        <div style={containerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>
              Programs
            </div>
            <button style={buttonStyle('primary')} onClick={handleCreateProgram} disabled={createProgram.isPending}>
              + Add Program
            </button>
          </div>

          {programs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-6)' }}>
              No programs yet. Click &quot;Add Program&quot; to create one.
            </div>
          ) : (
            <div style={programsGridStyle}>
              {programs.map((program) => (
                <div key={program.id} style={programCardStyle}>
                  <div style={programNameStyle}>{program.name}</div>
                  {program.degree_level && <div style={programDetailStyle}>Degree: {program.degree_level}</div>}
                  {program.field && <div style={programDetailStyle}>Field: {program.field}</div>}
                  {program.tuition_usd !== null && program.tuition_usd !== undefined && (
                    <div style={programDetailStyle}>Tuition: ${program.tuition_usd.toLocaleString()}</div>
                  )}
                  {program.min_gpa !== null && program.min_gpa !== undefined && (
                    <div style={programDetailStyle}>Min GPA: {program.min_gpa}</div>
                  )}
                  {program.min_ielts !== null && program.min_ielts !== undefined && (
                    <div style={programDetailStyle}>Min IELTS: {program.min_ielts}</div>
                  )}
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <button style={buttonStyle()} disabled={deleteProgram.isPending}>
                      Edit
                    </button>
                    <button
                      style={buttonStyle()}
                      onClick={() => handleDeleteProgram(program.id)}
                      disabled={deleteProgram.isPending}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
