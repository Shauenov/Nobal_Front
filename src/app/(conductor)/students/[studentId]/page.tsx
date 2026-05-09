'use client';

import { useParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import { useStudent } from '@/hooks/useStudents';

const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  boxShadow: 'var(--shadow-sm)',
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const getStudentId = (value: string | string[] | undefined) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? '';
  return '';
};

export default function StudentOverviewPage() {
  const params = useParams();
  const studentId = getStudentId(params.studentId);
  const student = useStudent(studentId);
  const data = student.data;

  if (student.isLoading) {
    return <div style={{ color: 'var(--color-text-secondary)' }}>Loading overview...</div>;
  }

  if (!data) {
    return <div style={{ color: 'var(--color-text-secondary)' }}>Student not found.</div>;
  }

  const summaryEntries = Object.entries(data.tasks_summary ?? {});

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div style={cardStyle}>
          <div style={labelStyle}>Profile Snapshot</div>
          <div style={{ marginTop: 'var(--space-3)', display: 'grid', gap: 'var(--space-2)' }}>
            <span>Group: {data.profile?.group_type ?? '—'}</span>
            <span>Course Year: {data.profile?.course_year ?? '—'}</span>
            <span>GPA: {data.profile?.gpa ?? '—'}</span>
            <span>IELTS: {data.profile?.ielts_passed ? 'Passed' : 'Not passed'}</span>
            <span>SAT: {data.profile?.sat_passed ? 'Passed' : 'Not passed'}</span>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Next Appointment</div>
          <div style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
            {data.next_appointment ? (
              <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                <span>Status: {data.next_appointment.status}</span>
                <span>Notes: {data.next_appointment.notes ?? '—'}</span>
              </div>
            ) : (
              'No upcoming appointment.'
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Active Roadmap</div>
          <div style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
            {data.active_roadmap ? (
              <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                <span>{data.active_roadmap.title}</span>
                <span>Assigned: {new Date(data.active_roadmap.assigned_at).toLocaleDateString()}</span>
              </div>
            ) : (
              'No active roadmap.'
            )}
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Task Summary</div>
        <div style={{ marginTop: 'var(--space-3)' }}>
          {summaryEntries.length === 0 ? (
            <span style={{ color: 'var(--color-text-secondary)' }}>No tasks summary yet.</span>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-2)', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
              {summaryEntries.map(([key, value]) => (
                <div key={key} style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-hover)' }}>
                  <div style={labelStyle}>{key}</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)' }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
