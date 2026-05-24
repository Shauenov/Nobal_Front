'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUniversity } from '@/hooks/useUniversities';
import { useUniversityEnrollments, useUpdateEnrollment } from '@/hooks/useEnrollments';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatGroup } from '@/lib/formatGroup';
import { useRoutePrefix } from '@/hooks/useRoutePrefix';
import type { EnrollmentStatus, EnrollmentWithStudentOut } from '@/types/api';

/* ── Enrollment status labels ── */
const STATUS_META: Record<EnrollmentStatus, { label: string; bg: string; color: string }> = {
  selected:  { label: 'Selected',  bg: '#e0f2fe', color: '#0369a1' },
  applying:  { label: 'Applying',  bg: '#fef9c3', color: '#a16207' },
  submitted: { label: 'Submitted', bg: '#ede9fe', color: '#6d28d9' },
  accepted:  { label: 'Accepted',  bg: '#dcfce7', color: '#166534' },
  rejected:  { label: 'Rejected',  bg: '#fee2e2', color: '#991b1b' },
};
const ENROLLMENT_STATUSES = Object.keys(STATUS_META) as EnrollmentStatus[];

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

export default function ApplicationsPage() {
  const params = useParams();
  const prefix = useRoutePrefix();
  const universityId = params.universityId as string;
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const { data: universityDetail } = useUniversity(universityId);
  const university = universityDetail?.university;

  const { data: enrollmentsData, isLoading } = useUniversityEnrollments(universityId, {
    status: statusFilter || undefined,
    page,
    page_size: PAGE_SIZE,
  });
  const updateEnrollment = useUpdateEnrollment();

  const enrollments = enrollmentsData?.data ?? [];
  const total = enrollmentsData?.meta.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  /* ── Styles ── */
  const thStyle: CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    borderBottom: '1px solid #f1f5f9',
    whiteSpace: 'nowrap',
  };

  const tdStyle: CSSProperties = {
    padding: '14px 16px',
    fontSize: '0.875rem',
    color: '#1e293b',
    borderBottom: '1px solid #f8fafc',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title="Список заявок"
        subtitle="Отслеживайте прогресс и успеваемость студентов 2–3 курсов."
        action={
          <Link
            href={`${prefix}/universities/${universityId}`}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0',
              fontSize: '0.875rem', fontWeight: 500, color: '#475569',
              textDecoration: 'none',
            }}
          >
            ← Назад
          </Link>
        }
      />

      {/* University name header */}
      {university && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e8ecf0',
            borderRadius: 14,
            padding: '18px 24px',
            boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            {university.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={university.logo_url}
                alt={university.name}
                style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', border: '1px solid #e8ecf0' }}
              />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                {university.name}
              </div>
              {[university.city, university.country].filter(Boolean).join(', ') && (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {[university.city, university.country].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
              {total} заявок
            </div>
          </div>

          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => { setStatusFilter(''); setPage(1); }}
              style={{
                padding: '4px 14px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 600,
                background: statusFilter === '' ? '#0f172a' : '#f1f5f9',
                color: statusFilter === '' ? '#fff' : '#64748b',
              }}
            >
              Все
            </button>
            {ENROLLMENT_STATUSES.map((s) => {
              const m = STATUS_META[s];
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  style={{
                    padding: '4px 14px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 600,
                    background: active ? m.color : m.bg,
                    color: active ? '#fff' : m.color,
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e8ecf0',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
        }}
      >
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Загрузка...</div>
        ) : enrollments.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
            <div style={{ fontWeight: 600, color: '#475569' }}>Нет заявок</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={thStyle}>Имя студента</th>
                <th style={thStyle}>Группа</th>
                <th style={thStyle}>Статус</th>
                <th style={thStyle}>Прогресс</th>
                <th style={thStyle}>Заявка</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enr: EnrollmentWithStudentOut) => {
                const group = formatGroup(enr.student.group_type, enr.student.course_year);
                const isActive = enr.student.is_active;
                const sm = STATUS_META[enr.status as EnrollmentStatus] ?? STATUS_META.selected;

                return (
                  <tr
                    key={enr.id}
                    style={{ transition: 'background 100ms' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    {/* Student name */}
                    <td style={tdStyle}>
                      <Link
                        href={`${prefix}/students/${enr.student_id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}
                      >
                        {enr.student.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={enr.student.avatar_url}
                            alt={enr.student.full_name}
                            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                            color: '#fff', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700,
                          }}>
                            {getInitials(enr.student.full_name)}
                          </div>
                        )}
                        <span style={{ fontWeight: 500 }}>{enr.student.full_name}</span>
                      </Link>
                    </td>

                    {/* Group */}
                    <td style={tdStyle}>
                      {group ? (
                        <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.875rem' }}>
                          {group}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>

                    {/* Active / Inactive */}
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600,
                        background: isActive ? '#f0fdf4' : '#fef2f2',
                        color: isActive ? '#15803d' : '#b91c1c',
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: isActive ? '#22c55e' : '#ef4444',
                          flexShrink: 0,
                        }} />
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Progress */}
                    <td style={{ ...tdStyle, minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: '#e8ecf0', borderRadius: 9999, overflow: 'hidden' }}>
                          <div style={{ width: `${enr.progress}%`, height: '100%', background: '#2563eb', borderRadius: 9999 }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', width: 28 }}>
                          {enr.progress}%
                        </span>
                      </div>
                    </td>

                    {/* Enrollment status selector */}
                    <td style={tdStyle}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 9999,
                        fontSize: '0.75rem', fontWeight: 600,
                        background: sm.bg, color: sm.color,
                        cursor: 'pointer',
                      }}>
                        <select
                          value={enr.status}
                          disabled={updateEnrollment.isPending}
                          onChange={(e) =>
                            updateEnrollment.mutate({
                              studentId: enr.student_id,
                              universityId,
                              data: { status: e.target.value as EnrollmentStatus },
                            })
                          }
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600, color: sm.color,
                            padding: 0, appearance: 'none',
                          }}
                        >
                          {ENROLLMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{STATUS_META[s].label}</option>
                          ))}
                        </select>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '14px 16px', borderTop: '1px solid #f1f5f9' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}
            >
              ← Назад
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: p === page ? '#2563eb' : '#f1f5f9', color: p === page ? '#fff' : '#475569', cursor: 'pointer', fontWeight: p === page ? 600 : 400 }}
                >
                  {p}
                </button>
              ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}
            >
              Вперёд →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
