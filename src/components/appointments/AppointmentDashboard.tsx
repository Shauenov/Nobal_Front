'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';
import { Users, CalendarCheck, Star, Calendar, Check, X, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  useAppointments,
  useCompleteAppointment,
  useCancelAppointment,
} from '@/hooks/useAppointments';
import { useStudents } from '@/hooks/useStudents';
import { useOverviewReport } from '@/hooks/useReports';
import type { AppointmentOut } from '@/types/api';
import { SlotManager } from './SlotManager';

/* ─── Status helpers ─────────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  pending: 'В процессе',
  confirmed: 'Подтверждено',
  completed: 'Завершено',
  cancelled: 'Отменено',
};

const STATUS_STYLE: Record<string, CSSProperties> = {
  pending:   { background: '#fef3c7', color: '#92400e' },
  confirmed: { background: '#dcfce7', color: '#15803d' },
  completed: { background: '#dbeafe', color: '#1d4ed8' },
  cancelled: { background: '#fee2e2', color: '#991b1b' },
};

const TYPE_LABEL: Record<string, string> = {
  video: 'Онлайн',
  audio: 'Аудиозвонок',
  chat: 'Чат',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '??';
}

/* ─── Metric card ────────────────────────────────────────── */
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ label, value, icon, color }: MetricCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        border: '1px solid #e8ecf0',
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#fff',
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.1 }}>
          {value ?? '—'}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

/* ─── Table styles ───────────────────────────────────────── */
const thStyle: CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '0.72rem',
  fontWeight: 600,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  background: '#f8fafc',
  borderBottom: '1px solid #e8ecf0',
};

const tdStyle: CSSProperties = {
  padding: '12px 14px',
  verticalAlign: 'middle',
  borderBottom: '1px solid #f1f5f9',
  fontSize: '0.875rem',
  color: '#1e293b',
};

/* ─── Main component ─────────────────────────────────────── */
export function AppointmentDashboard() {
  const [view, setView] = useState<'overview' | 'slots'>('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: appointments = [], isLoading: apptLoading } = useAppointments();
  const { data: studentsResp } = useStudents({ page: 1, page_size: 200 });
  const { data: report } = useOverviewReport();
  const completeAppt = useCompleteAppointment();
  const cancelAppt = useCancelAppointment();

  /* Student lookup map */
  const studentMap = useMemo(() => {
    const map: Record<string, { name: string; group: string }> = {};
    for (const s of studentsResp?.data ?? []) {
      map[s.id] = {
        name: s.full_name,
        group: [s.group_type, s.course_year].filter(Boolean).join('-'),
      };
    }
    return map;
  }, [studentsResp]);

  /* Metrics */
  const activeStudents = report?.total_students ?? studentsResp?.meta?.total ?? '—';
  const meetingsHeld = report?.appointments_this_month ?? appointments.filter((a) => a.status === 'completed').length;
  const avgGpa = report?.avg_gpa != null ? report.avg_gpa.toFixed(1) : '—';

  /* Next appointment (first pending or confirmed) */
  const nextAppointment = useMemo<AppointmentOut | null>(() => {
    const upcoming = appointments.filter(
      (a) => a.status === 'pending' || a.status === 'confirmed',
    );
    return upcoming[0] ?? null;
  }, [appointments]);

  /* Upcoming sessions (filtered by status, up to 10) */
  const sessions = useMemo(
    () =>
      appointments
        .filter((a) => a.status !== 'cancelled')
        .filter((a) => statusFilter === 'all' || a.status === statusFilter)
        .slice(0, 10),
    [appointments, statusFilter],
  );

  /* ── Slot-management view ── */
  if (view === 'slots') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PageHeader
          title="Управление слотами"
          subtitle="Создавайте и удаляйте временные слоты для записей"
          action={
            <button
              onClick={() => setView('overview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} />
              Назад к записям
            </button>
          }
        />
        <SlotManager />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Записи"
        subtitle="Управляйте расписанием и встречами со студентами"
        action={
          <button
            onClick={() => setView('slots')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#475569',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Calendar size={16} />
            Управление слотами
          </button>
        }
      />

      {/* ── Metric cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
      >
        <MetricCard
          label="Активные студенты"
          value={activeStudents}
          icon={<Users size={22} />}
          color="#2563eb"
        />
        <MetricCard
          label="Проведено встреч"
          value={meetingsHeld}
          icon={<CalendarCheck size={22} />}
          color="#10b981"
        />
        <MetricCard
          label="Средний балл"
          value={avgGpa}
          icon={<Star size={22} />}
          color="#f59e0b"
        />
      </div>

      {/* ── Main two-column area ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* ── Sessions table ── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e8ecf0',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
          }}
        >
          {/* Table header row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 18px 14px',
              borderBottom: '1px solid #e8ecf0',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>
              Ближайшие занятия
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 7,
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#475569',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">Все статусы</option>
              <option value="confirmed">Подтверждено</option>
              <option value="pending">В процессе</option>
              <option value="completed">Завершено</option>
            </select>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Студент</th>
                <th style={{ ...thStyle, width: 90 }}>Группа</th>
                <th style={{ ...thStyle, width: 130 }}>Статус</th>
                <th style={{ ...thStyle, width: 130 }}>Время</th>
                <th style={{ ...thStyle, width: 120 }}>Кабинет</th>
                <th style={{ ...thStyle, width: 90 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {apptLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j} style={tdStyle}>
                        <div
                          style={{
                            height: 14,
                            borderRadius: 4,
                            background: '#f1f5f9',
                            width: j === 0 ? 140 : 70,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      ...tdStyle,
                      textAlign: 'center',
                      color: '#94a3b8',
                      padding: '48px 0',
                    }}
                  >
                    Нет предстоящих записей
                  </td>
                </tr>
              ) : (
                sessions.map((appt) => {
                  const studentName = appt.student_name ?? null;
                  const timeStr = format(
                    new Date(appt.created_at),
                    'dd MMM, HH:mm',
                    { locale: ru },
                  );
                  return (
                    <tr key={appt.id} style={{ transition: 'background 150ms ease' }}>
                      {/* Student */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {studentName ? getInitials(studentName) : '??'}
                          </div>
                          <span style={{ fontWeight: 500 }}>
                            {studentName ?? `Студент ${appt.student_id.slice(0, 6)}…`}
                          </span>
                        </div>
                      </td>

                      {/* Group */}
                      <td style={{ ...tdStyle, color: '#64748b' }}>
                        {studentMap[appt.student_id]?.group || '—'}
                      </td>

                      {/* Status badge */}
                      <td style={tdStyle}>
                        <span
                          style={{
                            ...STATUS_STYLE[appt.status],
                            padding: '3px 10px',
                            borderRadius: 9999,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                          }}
                        >
                          {STATUS_LABEL[appt.status] ?? appt.status}
                        </span>
                      </td>

                      {/* Time */}
                      <td style={{ ...tdStyle, color: '#64748b', fontSize: '0.8rem' }}>
                        {timeStr}
                      </td>

                      {/* Type / Cabinet */}
                      <td style={{ ...tdStyle, color: '#64748b', fontSize: '0.8rem' }}>
                        {TYPE_LABEL[appt.consultation_type] ?? appt.consultation_type}
                      </td>

                      {/* Actions */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {appt.status === 'confirmed' && (
                            <button
                              title="Завершить"
                              onClick={() => completeAppt.mutate(appt.id)}
                              disabled={completeAppt.isPending}
                              style={{
                                padding: 6,
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: '#16a34a',
                                borderRadius: 6,
                              }}
                            >
                              <Check size={15} />
                            </button>
                          )}
                          {(appt.status === 'pending' || appt.status === 'confirmed') && (
                            <button
                              title="Отменить"
                              onClick={() => cancelAppt.mutate({ id: appt.id })}
                              disabled={cancelAppt.isPending}
                              style={{
                                padding: 6,
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: '#ef4444',
                                borderRadius: 6,
                              }}
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Next consultation card */}
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e8ecf0',
              padding: 20,
              boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: '0.95rem',
                color: '#1e293b',
                marginBottom: 16,
              }}
            >
              Ближайшая консультация
            </div>

            {nextAppointment ? (
              <>
                {/* Time badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    borderRadius: 8,
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  <CalendarCheck size={13} />
                  {format(new Date(nextAppointment.created_at), "dd MMM, HH:mm", { locale: ru })}
                </div>

                {/* Student info — click to open profile */}
                <Link
                  href={`/students/${nextAppointment.student_id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 4,
                    textDecoration: 'none',
                    borderRadius: 10,
                    padding: '8px 6px',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {nextAppointment.student_name
                      ? getInitials(nextAppointment.student_name)
                      : '??'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>
                      {nextAppointment.student_name ??
                        `Студент ${nextAppointment.student_id.slice(0, 8)}…`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                      {TYPE_LABEL[nextAppointment.consultation_type] ?? nextAppointment.consultation_type}
                      {studentMap[nextAppointment.student_id]?.group
                        ? ` · Группа ${studentMap[nextAppointment.student_id].group}`
                        : ''}
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 0',
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                }}
              >
                Нет предстоящих консультаций
              </div>
            )}
          </div>

          {/* Today's tasks panel */}
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e8ecf0',
              padding: 20,
              boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>
                Задачи на сегодня
              </span>
              <span
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  borderRadius: 9999,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 10px',
                }}
              >
                {appointments.filter((a) => a.status === 'completed').length} /{' '}
                {appointments.filter((a) => a.status !== 'cancelled').length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {appointments.filter((a) => a.status !== 'cancelled').slice(0, 5).map((appt) => {
                const done = appt.status === 'completed';
                return (
                  <div
                    key={appt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        border: done ? 'none' : '2px solid #cbd5e1',
                        background: done ? '#2563eb' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {done && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="#fff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: done ? '#94a3b8' : '#1e293b',
                        textDecoration: done ? 'line-through' : 'none',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {appt.student_name
                        ? `Встреча со студентом ${appt.student_name}`
                        : `Консультация · ${TYPE_LABEL[appt.consultation_type] ?? appt.consultation_type}`}
                    </span>
                  </div>
                );
              })}

              {appointments.filter((a) => a.status !== 'cancelled').length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '16px 0',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                  }}
                >
                  Нет задач на сегодня
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
