'use client';

import { useParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import { CalendarCheck, BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useStudent } from '@/hooks/useStudents';

/* ─── Helpers ─── */
const getStudentId = (v: string | string[] | undefined) =>
  Array.isArray(v) ? (v[0] ?? '') : (v ?? '');

/* ─── Shared styles ─── */
const card: CSSProperties = {
  background: '#fff',
  border: '1px solid #e8ecf0',
  borderRadius: 14,
  padding: 20,
  boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
};

const sectionLabel: CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 14,
};

const row: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '7px 0',
  borderBottom: '1px solid #f1f5f9',
  fontSize: '0.875rem',
};

const rowKey: CSSProperties = { color: '#64748b' };
const rowVal: CSSProperties = { fontWeight: 600, color: '#1e293b' };

/* ─── Mini stat card ─── */
function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e8ecf0',
        borderRadius: 12,
        padding: '14px 16px',
        boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
      }}
    >
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color, lineHeight: 1.1 }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* ─── Status badge ─── */
const STATUS_RU: Record<string, string> = {
  pending: 'В процессе',
  confirmed: 'Подтверждено',
  completed: 'Завершено',
  cancelled: 'Отменено',
};
const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#fef3c7', color: '#92400e' },
  confirmed: { bg: '#dcfce7', color: '#15803d' },
  completed: { bg: '#dbeafe', color: '#1d4ed8' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

const TASK_STATUS_RU: Record<string, string> = {
  pending:     'Ожидает',
  in_progress: 'В работе',
  completed:   'Завершено',
  overdue:     'Просрочено',
};
const TASK_ICONS: Record<string, React.ReactNode> = {
  completed:   <CheckCircle size={14} color="#16a34a" />,
  in_progress: <Clock size={14} color="#2563eb" />,
  overdue:     <AlertCircle size={14} color="#dc2626" />,
  pending:     <Clock size={14} color="#94a3b8" />,
};

/* ─── Page ─── */
export default function StudentOverviewPage() {
  const params = useParams();
  const studentId = getStudentId(params.studentId);
  const { data, isLoading } = useStudent(studentId);

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ ...card, height: 90, background: '#f8fafc' }} />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ ...card, textAlign: 'center', padding: 48, color: '#94a3b8' }}>
        Данные студента недоступны
      </div>
    );
  }

  const { profile, tasks_summary, next_appointment, active_roadmap } = data;

  /* Task summary entries */
  const taskEntries = Object.entries(tasks_summary ?? {});
  const totalTasks = taskEntries.reduce((s, [, v]) => s + v, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Quick stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <StatChip label="GPA" value={profile?.gpa != null ? Number(profile.gpa).toFixed(1) : '—'} color="#2563eb" />
        <StatChip label="Балл IELTS" value={profile?.ielts_score ?? (profile?.ielts_passed ? 'Сдан' : '—')} color="#10b981" />
        <StatChip label="Балл SAT" value={profile?.sat_score ?? (profile?.sat_passed ? 'Сдан' : '—')} color="#f59e0b" />
        <StatChip label="Задач всего" value={totalTasks || '—'} color="#8b5cf6" />
      </div>

      {/* ── Two-column ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Profile snapshot */}
        <div style={card}>
          <div style={sectionLabel}>Профиль</div>
          {[
            ['Группа', profile?.group_type ?? '—'],
            ['Курс', profile?.course_year ? `${profile.course_year}-й курс` : '—'],
            ['Бюджет', profile?.budget_max ? `$${Number(profile.budget_max).toLocaleString()}` : '—'],
            ['Специальность', profile?.target_major ?? '—'],
          ].map(([k, v]) => (
            <div key={k} style={row}>
              <span style={rowKey}>{k}</span>
              <span style={rowVal}>{v}</span>
            </div>
          ))}

          {/* Target countries */}
          {Array.isArray(profile?.target_countries) && profile.target_countries.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(profile.target_countries as string[]).map((c) => (
                <span
                  key={c}
                  style={{
                    padding: '2px 10px',
                    borderRadius: 9999,
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Next appointment */}
          <div style={card}>
            <div style={sectionLabel}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarCheck size={12} />
                Ближайшая консультация
              </span>
            </div>
            {next_appointment ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 9999,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    ...(STATUS_COLOR[next_appointment.status] ?? { bg: '#f1f5f9', color: '#475569' }),
                  }}
                >
                  {STATUS_RU[next_appointment.status] ?? next_appointment.status}
                </span>
                {next_appointment.notes && (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {next_appointment.notes}
                  </span>
                )}
              </div>
            ) : (
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Нет предстоящих консультаций</span>
            )}
          </div>

          {/* Active roadmap */}
          <div style={card}>
            <div style={sectionLabel}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={12} />
                Активный маршрут
              </span>
            </div>
            {active_roadmap ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>
                  {active_roadmap.title ?? 'Без названия'}
                </div>
                {active_roadmap.assigned_at && (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Назначена: {new Date(active_roadmap.assigned_at).toLocaleDateString('ru-RU')}
                  </div>
                )}
              </div>
            ) : (
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Нет активного маршрута</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Task summary ── */}
      {taskEntries.length > 0 && (
        <div style={card}>
          <div style={sectionLabel}>Задачи</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {taskEntries.map(([status, count]) => (
              <div
                key={status}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e8ecf0',
                }}
              >
                {TASK_ICONS[status] ?? <Clock size={14} color="#94a3b8" />}
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>{count}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
                    {TASK_STATUS_RU[status] ?? status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {profile?.notes && (
        <div style={card}>
          <div style={sectionLabel}>Заметки</div>
          <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>
            {profile.notes}
          </p>
        </div>
      )}
    </div>
  );
}
