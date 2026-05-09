'use client';

import { useParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import { useStudentRoadmaps } from '@/hooks/useRoadmaps';

const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  boxShadow: 'var(--shadow-sm)',
};

const getStudentId = (value: string | string[] | undefined) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? '';
  return '';
};

export default function StudentRoadmapsPage() {
  const params = useParams();
  const studentId = getStudentId(params.studentId);
  const roadmaps = useStudentRoadmaps(studentId);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div style={cardStyle}>
        {roadmaps.isLoading ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>Loading roadmaps...</div>
        ) : roadmaps.data?.length ? (
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {roadmaps.data.map((roadmap) => (
              <div
                key={roadmap.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-hover)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'var(--font-medium)' }}>{roadmap.title}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    Assigned: {new Date(roadmap.assigned_at).toLocaleDateString()}
                  </div>
                </div>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    background: roadmap.is_active ? 'var(--color-success-bg)' : 'var(--color-surface)',
                    color: roadmap.is_active ? 'var(--color-success)' : 'var(--color-text-secondary)',
                  }}
                >
                  {roadmap.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--color-text-secondary)' }}>No roadmaps assigned.</div>
        )}
      </div>
    </div>
  );
}
