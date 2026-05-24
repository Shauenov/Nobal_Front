'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
import type { StudentListItem } from '@/types/api';
import { formatGroup } from '@/lib/formatGroup';
import { useRoutePrefix } from '@/hooks/useRoutePrefix';

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


/**
 * Алгоритм активности студента (5 точек):
 *
 * Оценивает активность по исполнению заданий:
 *   score = (done * 3 + in_progress * 1.5 - overdue * 2) / max(total, 1) * 100
 *   Зажатое в [0, 100], делим на 20 → 0-5 точек
 *
 * Цвета точек:
 *   • Зелёные = активные точки (студент работает/выполняет)
 *   • Красные = проблемные (если overdue > 30% от total, часть зелёных красные)
 *   • Серые = нет активности / нет задач
 */
function ActivityDots({
  total,
  done,
  overdue,
  inProgress,
}: {
  total: number;
  done: number;
  overdue: number;
  inProgress: number;
}) {
  const COUNT = 5;

  if (total === 0) {
    // Нет задач — все серые
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: COUNT }).map((_, i) => (
          <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: '#cbd5e1' }} />
        ))}
      </div>
    );
  }

  // Нормализуем к 0-100
  const raw = ((done * 3 + inProgress * 1.5 - overdue * 2) / total) * 100;
  const score = Math.max(0, Math.min(100, raw));
  // Кол-во активных точек: 0-5
  const activeDots = Math.round((score / 100) * COUNT);
  // Кол-во "красных" точек (если много просроченных)
  const overdueRatio = overdue / total;
  const redDots = overdueRatio > 0.3
    ? Math.max(1, Math.round(overdueRatio * COUNT - activeDots * 0.5))
    : 0;
  const greenDots = Math.max(0, activeDots - redDots);
  const grayDots = COUNT - greenDots - redDots;

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: greenDots }).map((_, i) => (
        <span key={`g${i}`} style={{ width: 11, height: 11, borderRadius: '50%', background: '#22c55e' }} />
      ))}
      {Array.from({ length: redDots }).map((_, i) => (
        <span key={`r${i}`} style={{ width: 11, height: 11, borderRadius: '50%', background: '#ef4444' }} />
      ))}
      {Array.from({ length: Math.max(0, grayDots) }).map((_, i) => (
        <span key={`gr${i}`} style={{ width: 11, height: 11, borderRadius: '50%', background: '#cbd5e1' }} />
      ))}
    </div>
  );
}

/** Three-dot context menu */
function ThreeDotMenu({
  studentId,
  onDelete,
}: {
  studentId: string;
  onDelete: (id: string) => void;
}) {
  const prefix = useRoutePrefix();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const menuStyle: CSSProperties = {
    position: 'absolute',
    top: 28,
    right: 0,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
    zIndex: 50,
    minWidth: 160,
    overflow: 'hidden',
  };

  const itemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    fontSize: '0.82rem',
    fontWeight: 500,
    cursor: 'pointer',
    color: '#334155',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    transition: 'background 100ms',
  };

  return (
    <div ref={ref} style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#94a3b8',
          padding: '2px 4px',
          borderRadius: 6,
          fontSize: '1.2rem',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label="Меню"
      >
        ⋮
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div style={menuStyle}>
            <Link
              href={`${prefix}/students/${studentId}`}
              style={{ ...itemStyle, textDecoration: 'none' }}
              onClick={() => setOpen(false)}
            >
              👤 Профиль студента
            </Link>
            <Link
              href={`${prefix}/messages?student=${studentId}`}
              style={{ ...itemStyle, textDecoration: 'none' }}
              onClick={() => setOpen(false)}
            >
              💬 Написать сообщение
            </Link>
            <Link
              href={`${prefix}/tasks?student=${studentId}`}
              style={{ ...itemStyle, textDecoration: 'none' }}
              onClick={() => setOpen(false)}
            >
              📋 Назначить задание
            </Link>
            <div style={{ borderTop: '1px solid #f1f5f9' }} />
            <button
              type="button"
              style={{ ...itemStyle, color: '#ef4444' }}
              onClick={() => {
                setOpen(false);
                onDelete(studentId);
              }}
            >
              🗑 Удалить студента
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function StudentCard({ student, onDelete }: StudentCardProps) {
  const router = useRouter();
  const prefix = useRoutePrefix();

  const progress =
    student.tasks_total > 0
      ? Math.round((student.tasks_done / student.tasks_total) * 100)
      : 0;

  const overdue = student.tasks_overdue ?? 0;
  const inProgress = student.tasks_in_progress ?? 0;

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e8ecf0',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
        overflow: 'hidden',
        transition: 'box-shadow 150ms ease, transform 150ms ease',
        cursor: 'pointer',
      }}
      onClick={() => router.push(`${prefix}/students/${student.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`${prefix}/students/${student.id}`)}
    >
      {/* ── Header: avatar + name + menu ── */}
      <div
        style={{
          padding: '16px 16px 12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        {/* Avatar */}
        {student.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={student.avatar_url}
            alt={student.full_name}
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #e8ecf0',
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 700,
              flexShrink: 0,
              border: '2px solid #e8ecf0',
            }}
          >
            {getInitials(student.full_name)}
          </div>
        )}

        {/* Name + group */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: '0.92rem',
              color: '#1e293b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.3,
              marginBottom: 4,
            }}
          >
            {student.full_name}
          </div>
          {formatGroup(student.group_type, student.course_year) && (
            <div
              style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#2563eb',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: 6,
              }}
            >
              {formatGroup(student.group_type, student.course_year)}
            </div>
          )}
        </div>

        {/* Three-dot menu */}
        <div onClick={(e) => e.stopPropagation()}>
          <ThreeDotMenu studentId={student.id} onDelete={onDelete} />
        </div>
      </div>

      {/* ── Progress ── */}
      <div style={{ padding: '0 16px 14px' }}>
        {/* Label + percent */}
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
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            Прогресс
          </span>
          <span
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#2563eb',
            }}
          >
            {progress}%
          </span>
        </div>

        {/* Bar */}
        <div
          style={{
            height: 6,
            borderRadius: 9999,
            background: '#e2e8f0',
            overflow: 'hidden',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
              borderRadius: 9999,
              transition: 'width 500ms ease',
            }}
          />
        </div>

        {/* Activity dots */}
        <ActivityDots
          total={student.tasks_total}
          done={student.tasks_done}
          overdue={overdue}
          inProgress={inProgress}
        />
      </div>

      {/* ── Action buttons ── */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Написать сообщение */}
        <Link
          href={`${prefix}/messages?student=${student.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '11px 16px',
            fontSize: '0.82rem',
            fontWeight: 500,
            color: '#475569',
            textDecoration: 'none',
            borderBottom: '1px solid #f1f5f9',
            transition: 'background 100ms',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageIcon />
          Написать сообщение
        </Link>

        {/* Назначить задание */}
        <Link
          href={`${prefix}/tasks?student=${student.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            margin: '10px 16px 12px',
            padding: '8px 12px',
            fontSize: '0.82rem',
            fontWeight: 500,
            color: '#2563eb',
            border: '1.5px solid #2563eb',
            borderRadius: 8,
            textDecoration: 'none',
            transition: 'all 120ms',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <TaskIcon />
          Назначить задание
        </Link>
      </div>
    </div>
  );
}

function MessageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
