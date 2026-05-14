import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Badge } from '@/components/ui/Badge';
import { StudentListItem } from '@/types/api';

interface StudentTableProps {
  students: StudentListItem[];
  onDelete: (id: string) => void;
}

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 'var(--text-sm)',
};

const headerStyle: CSSProperties = {
  textAlign: 'left',
  color: 'var(--color-text-disabled)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-semibold)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  paddingBottom: 'var(--space-2)',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'ST';

const gpaColor = (gpa?: number | null) => {
  if (gpa === null || gpa === undefined) return 'var(--color-text-secondary)';
  if (gpa >= 3.5) return 'var(--color-success)';
  if (gpa >= 2.5) return 'var(--color-warning)';
  return 'var(--color-error)';
};

export function StudentTable({ students, onDelete }: StudentTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={headerStyle}>Student</th>
            <th style={headerStyle}>Email</th>
            <th style={headerStyle}>Group</th>
            <th style={headerStyle}>GPA</th>
            <th style={headerStyle}>IELTS</th>
            <th style={headerStyle}>SAT</th>
            <th style={headerStyle}>Tasks</th>
            <th style={headerStyle}>Unread</th>
            <th style={headerStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const progress =
              student.tasks_total > 0
                ? Math.round((student.tasks_done / student.tasks_total) * 100)
                : 0;

            return (
              <tr key={student.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                <td style={{ padding: 'var(--space-3) 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {getInitials(student.full_name)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{student.full_name}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                        {student.course_year ? `Year ${student.course_year}` : '—'}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{student.email}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>
                  {student.group_type ?? '—'}
                </td>
                <td style={{ color: gpaColor(student.gpa) }}>{student.gpa ?? '—'}</td>
                <td>
                  <Badge variant={student.ielts_passed ? 'success' : 'neutral'}>
                    {student.ielts_passed ? 'Passed' : '—'}
                  </Badge>
                </td>
                <td>
                  <Badge variant={student.sat_passed ? 'success' : 'neutral'}>
                    {student.sat_passed ? 'Passed' : '—'}
                  </Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      {student.tasks_done}/{student.tasks_total}
                    </span>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-surface-hover)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: '100%',
                          background: 'var(--color-primary)',
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  {student.unread_messages > 0 ? (
                    <Badge variant="danger">
                      {student.unread_messages}
                    </Badge>
                  ) : (
                    <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <Link href={`/students/${student.id}`} style={{ color: 'var(--color-primary)' }}>
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(student.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-error)',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
