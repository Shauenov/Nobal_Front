'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useParams } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { useUniversity, useUpdateUniversity, useCreateProgram, useDeleteProgram, useUploadLogo, useUploadCover } from '@/hooks/useUniversities';
import { useUniversityEnrollments, useUpdateEnrollment } from '@/hooks/useEnrollments';
import { PageHeader } from '@/components/layout/PageHeader';
import { UniversityForm } from '@/components/universities/UniversityForm';
import { ImageUpload } from '@/components/ui/ImageUpload';
import type { EnrollmentStatus, EnrollmentWithStudentOut, UniversityCreate } from '@/types/api';

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

const statusColors: Record<EnrollmentStatus, { bg: string; color: string; label: string }> = {
  selected:  { bg: '#e0f2fe', color: '#0369a1', label: 'Выбран' },
  applying:  { bg: '#fef9c3', color: '#a16207', label: 'Подаёт' },
  submitted: { bg: '#ede9fe', color: '#6d28d9', label: 'Подано' },
  accepted:  { bg: '#dcfce7', color: '#166534', label: 'Принят' },
  rejected:  { bg: '#fee2e2', color: '#991b1b', label: 'Отказано' },
};

const ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  'selected', 'applying', 'submitted', 'accepted', 'rejected',
];

export default function UniversityDetailPage() {
  const params = useParams();
  const universityId = params.universityId as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'enrollments'>('overview');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<string>('');

  const { data: universityDetail, isLoading } = useUniversity(universityId);
  const setPageTitle = useUIStore((s) => s.setPageTitle);

  // Set breadcrumb label to university name; clear on unmount
  useEffect(() => {
    if (universityDetail?.university?.name) {
      setPageTitle(universityDetail.university.name);
    }
    return () => setPageTitle(null);
  }, [universityDetail?.university?.name, setPageTitle]);
  const updateUniversity = useUpdateUniversity(universityId);
  const uploadLogo = useUploadLogo(universityId);
  const uploadCover = useUploadCover(universityId);
  const createProgram = useCreateProgram(universityId);
  const deleteProgram = useDeleteProgram(universityId);

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useUniversityEnrollments(
    universityId,
    enrollmentStatusFilter ? { status: enrollmentStatusFilter } : undefined
  );
  const updateEnrollment = useUpdateEnrollment();

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
        <button
          style={tabButtonStyle(activeTab === 'enrollments')}
          onClick={() => setActiveTab('enrollments')}
        >
          Applications {enrollmentsData ? `(${enrollmentsData.meta.total})` : '(0)'}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div style={containerStyle}>
          {/* Image uploads — only available when editing an existing university */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <ImageUpload
              currentImageUrl={university.logo_url}
              onUpload={async (file) => { await uploadLogo.mutateAsync(file); }}
              isUploading={uploadLogo.isPending}
              label="Логотип университета"
            />
            <ImageUpload
              currentImageUrl={university.cover_image_url}
              onUpload={async (file) => { await uploadCover.mutateAsync(file); }}
              isUploading={uploadCover.isPending}
              label="Обложка университета"
            />
          </div>

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
      {activeTab === 'enrollments' && (
        <div style={containerStyle}>
          {/* Status filter */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              Статус:
            </span>
            <button
              style={{
                ...buttonStyle(enrollmentStatusFilter === '' ? 'primary' : 'ghost'),
                fontSize: 'var(--text-xs)',
              }}
              onClick={() => setEnrollmentStatusFilter('')}
            >
              Все
            </button>
            {ENROLLMENT_STATUSES.map((s) => (
              <button
                key={s}
                style={{
                  ...buttonStyle(enrollmentStatusFilter === s ? 'primary' : 'ghost'),
                  fontSize: 'var(--text-xs)',
                }}
                onClick={() => setEnrollmentStatusFilter(s)}
              >
                {statusColors[s].label}
              </button>
            ))}
          </div>

          {enrollmentsLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
              Загрузка...
            </div>
          ) : !enrollmentsData?.data.length ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
              Нет заявок
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Студент', 'Статус', 'Прогресс', 'Дата', 'Действие'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--color-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enrollmentsData.data.map((enrollment: EnrollmentWithStudentOut) => {
                  const sc = statusColors[enrollment.status as EnrollmentStatus] ?? statusColors.selected;
                  return (
                    <tr
                      key={enrollment.id}
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      {/* Student */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {enrollment.student.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={enrollment.student.avatar_url}
                              alt={enrollment.student.full_name}
                              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: 'var(--color-primary)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 'var(--font-semibold)',
                              }}
                            >
                              {enrollment.student.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                            {enrollment.student.full_name}
                          </span>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-medium)',
                            background: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {sc.label}
                        </span>
                      </td>

                      {/* Progress bar */}
                      <td style={{ padding: '10px 12px', minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <div
                            style={{
                              flex: 1,
                              height: 6,
                              background: 'var(--color-border)',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${enrollment.progress}%`,
                                height: '100%',
                                background: 'var(--color-primary)',
                                borderRadius: 3,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', width: 30 }}>
                            {enrollment.progress}%
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '10px 12px', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        {new Date(enrollment.created_at).toLocaleDateString('ru-RU')}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 12px' }}>
                        <select
                          style={{
                            fontSize: 'var(--text-xs)',
                            padding: '4px 6px',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-primary)',
                            cursor: 'pointer',
                          }}
                          value={enrollment.status}
                          disabled={updateEnrollment.isPending}
                          onChange={(e) =>
                            updateEnrollment.mutate({
                              studentId: enrollment.student_id,
                              universityId: universityId,
                              data: { status: e.target.value as EnrollmentStatus },
                            })
                          }
                        >
                          {ENROLLMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {statusColors[s].label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination info */}
          {enrollmentsData && enrollmentsData.meta.total > enrollmentsData.data.length && (
            <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              Показано {enrollmentsData.data.length} из {enrollmentsData.meta.total}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
