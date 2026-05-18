'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
import type { StudentListItem } from '@/types/api';

interface StudentCardProps {
  student: StudentListItem;
  onDelete: (id: string) => void;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || 'ST';

/** Returns up to 5 coloured dots representing task completion state */
function TaskDots({ done, total, overdue }: { done: number; total: number; overdue: number }) {
  const count = Math.max(total, 3);
  const dots: ('done' | 'overdue' | 'pending')[] = [];
  for (let i = 0; i < Math.min(count, 5); i++) {
    if (i < done) dots.push('done');
    else if (i < done + overdue) dots.push('overdue');
    else dots.push('pending');
  }
  const color = (s: 'done' | 'overdue' | 'pending') =>
    s === 'done' ? '#22c55e' : s === 'overdue' ? '#ef4444' : '#facc15';

  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {dots.map((s, i) => (
        <span
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: color(s),
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

export function StudentCard({ student }: StudentCardProps) {
  const router = useRouter();

  const progress =
    student.tasks_total > 0
      ? Math.round((student.tasks_done / student.tasks_total) * 100)
      : 0;

  const overdue = Math.max(0, student.tasks_total - student.tasks_done);

  const cardStyle: CSSProperties = {
    background: '#fff',
    border: '1px solid #e8ecf0',
    borderRadius: 16,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
    transition: 'box-shadow 150ms ease, transform 150ms ease',
    cursor: 'pointer',
  };

  return (
    <div
      style={cardStyle}
      onClick={() => router.push(`/students/${student.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`/students/${student.id}`)}
    >
      {/* Top section: avatar + name */}
      <div
        style={{
          padding: '20px 20px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          background: 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)',
        }}
      >
        {/* Avatar */}
        {student.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={student.avatar_url}
            alt={student.full_name}
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          />
        ) : (
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 700,
              border: '3px solid #fff',
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              flexShrink: 0,
            }}
          >
            {getInitials(student.full_name)}
          </div>
        )}

        {/* Name + group */}
        <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#1e293b',
              marginBottom: 4,
            }}
          >
            {student.full_name}
          </div>
          {(student.group_type || student.course_year) && (
            <div
              style={{
                fontSize: '0.78rem',
                color: '#64748b',
                background: '#f1f5f9',
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 9999,
              }}
            >
              {student.group_type}
              {student.course_year ? `-${student.course_year}` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Progress section */}
      <div
        style={{
          padding: '12px 20px 14px',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Прогресс
          </span>
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: progress >= 70 ? '#16a34a' : progress >= 40 ? '#ca8a04' : '#dc2626',
            }}
          >
            {progress}%
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 5,
            borderRadius: 9999,
            background: '#e2e8f0',
            overflow: 'hidden',
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background:
                progress >= 70
                  ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                  : progress >= 40
                  ? 'linear-gradient(90deg, #facc15, #eab308)'
                  : 'linear-gradient(90deg, #f87171, #ef4444)',
              borderRadius: 9999,
              transition: 'width 400ms ease',
            }}
          />
        </div>

        {/* Status dots */}
        <TaskDots
          done={student.tasks_done}
          total={student.tasks_total}
          overdue={overdue}
        />
      </div>

      {/* Action buttons */}
      <div
        style={{
          padding: '0 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          href={`/messages?student=${student.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#475569',
            fontSize: '0.78rem',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 150ms ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          ✉ Написать сообщение
        </Link>
        <Link
          href={`/tasks?student=${student.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#475569',
            fontSize: '0.78rem',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 150ms ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          ＋ Назначить задание
        </Link>
      </div>
    </div>
  );
}
