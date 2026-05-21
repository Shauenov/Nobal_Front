'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { format, differenceInMinutes, isToday, isTomorrow, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';
import { Users, CalendarCheck, CheckCircle2, Calendar, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatGroup } from '@/lib/formatGroup';
import {
  useAppointments,
  useCompleteAppointment,
  useCancelAppointment,
} from '@/hooks/useAppointments';
import { useStudents } from '@/hooks/useStudents';
import { useOverviewReport } from '@/hooks/useReports';
import type { AppointmentOut } from '@/types/api';
import { SlotManager } from './SlotManager';

/* ─── Status config ──────────────────────────────────────────── */
const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  pending:      { label: 'В процессе',   bg: '#fef3c7', color: '#d97706' },
  confirmed:    { label: 'Подтверждено', bg: '#dcfce7', color: '#16a34a' },
  completed:    { label: 'Завершено',    bg: '#dbeafe', color: '#2563eb' },
  cancelled:    { label: 'Отменено',     bg: '#fee2e2', color: '#dc2626' },
  rescheduled:  { label: 'Перенос',      bg: '#fff7ed', color: '#ea580c' },
};

const TYPE_LABEL: Record<string, string> = {
  video: 'Online (Zoom)',
  audio: 'Online (Audio)',
  chat:  'Чат',
};

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '??';
}

function formatSlotTime(startIso?: string | null, endIso?: string | null): [string, string] {
  if (!startIso) return ['—', ''];
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : null;
  const timeRange = format(start, 'HH:mm') + (end ? ' - ' + format(end, 'HH:mm') : '');
  if (isToday(start)) return ['Сегодня', timeRange];
  if (isTomorrow(start)) return ['Завтра', timeRange];
  return [format(start, 'dd MMM', { locale: ru }), timeRange];
}

function formatTimeUntil(startIso?: string | null): string {
  if (!startIso) return 'Скоро';
  const start = new Date(startIso);
  const diff = differenceInMinutes(start, new Date());
  if (diff <= 0) return 'Сейчас';
  if (diff < 60) return `Через ${diff} минут`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `Через ${hours} ч`;
  return format(start, 'dd MMM, HH:mm', { locale: ru });
}

/* ─── Metric card ────────────────────────────────────────────── */
function MetricCard({
  label, value, icon, iconBg, iconColor,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      border: '1px solid #e8ecf0',
      padding: '20px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: iconColor,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.1 }}>
          {value ?? '—'}
        </div>
      </div>
    </div>
  );
}

/* ─── Table styles ───────────────────────────────────────────── */
const thStyle: CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: '0.72rem',
  fontWeight: 600,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  borderBottom: '1px solid #e8ecf0',
  background: 'transparent',
  whiteSpace: 'nowrap',
};

const tdStyle: CSSProperties = {
  padding: '13px 16px',
  verticalAlign: 'middle',
  borderBottom: '1px solid #f1f5f9',
  fontSize: '0.875rem',
  color: '#1e293b',
};

/* ─── Main component ─────────────────────────────────────────── */
export function AppointmentDashboard() {
  const [view, setView] = useState<'overview' | 'slots'>('overview');
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

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
        group: formatGroup(s.group_type, s.course_year) ?? '',
      };
    }
    return map;
  }, [studentsResp]);

  /* Period cutoff date */
  const periodStart = useMemo(() => {
    const now = new Date();
    if (period === 'week')  return startOfWeek(now, { weekStartsOn: 1 });
    if (period === 'year')  return startOfYear(now);
    return startOfMonth(now);
  }, [period]);

  const PERIOD_LABEL: Record<string, string> = {
    week:  'за неделю',
    month: 'за месяц',
    year:  'за год',
  };

  /* Metrics */
  const activeStudents = report?.total_students ?? studentsResp?.meta?.total ?? '—';

  const meetingsHeld = useMemo(
    () => appointments.filter((a) => {
      if (a.status !== 'completed') return false;
      const t = a.slot_start_time ?? a.created_at;
      return t ? new Date(t) >= periodStart : false;
    }).length,
    [appointments, periodStart],
  );

  // Unique students who booked at least one appointment in the period
  const studentsBookedInPeriod = useMemo(
    () => new Set(
      appointments
        .filter((a) => {
          if (a.status === 'cancelled') return false;
          const t = a.slot_start_time ?? a.created_at;
          return t ? new Date(t) >= periodStart : false;
        })
        .map((a) => a.student_id)
    ).size,
    [appointments, periodStart],
  );

  /* Next upcoming appointment */
  const nextAppointment = useMemo<AppointmentOut | null>(() => {
    return (
      appointments.find((a) => a.status === 'pending' || a.status === 'confirmed') ?? null
    );
  }, [appointments]);

  /* Visible sessions (exclude cancelled, max 10) */
  const sessions = useMemo(
    () => appointments.filter((a) => a.status !== 'cancelled').slice(0, 10),
    [appointments],
  );

  /* ── Slot management view ── */
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
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: '#fff', color: '#475569', fontSize: '0.875rem',
                fontWeight: 600, cursor: 'pointer',
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

  /* ── Overview ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title="Записи"
        subtitle="Отслеживайте прогресс и успеваемость студентов 2–3 курсов."
        action={
          <button
            onClick={() => setView('slots')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: '#fff', color: '#475569', fontSize: '0.875rem',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Calendar size={16} />
            Управление слотами
          </button>
        }
      />

      {/* ── Ключевые метрики ── */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 14,
        }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
            Ключевые метрики
          </span>

          {/* Period picker */}
          <div style={{ position: 'relative' }}>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
              style={{
                appearance: 'none',
                padding: '8px 36px 8px 14px',
                borderRadius: 8,
                border: 'none',
                background: '#0f172a',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="week">За Неделю</option>
              <option value="month">За Месяц</option>
              <option value="year">За Год</option>
            </select>
            <span style={{
              position: 'absolute', right: 10, top: '50%',
              transform: 'translateY(-50%)', color: '#fff',
              pointerEvents: 'none', fontSize: '0.65rem',
            }}>
              ▼
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <MetricCard
            label="Активные студенты"
            value={activeStudents}
            icon={<Users size={22} />}
            iconBg="#eff6ff"
            iconColor="#2563eb"
          />
          <MetricCard
            label={`Проведено встреч ${PERIOD_LABEL[period]}`}
            value={meetingsHeld}
            icon={<CalendarCheck size={22} />}
            iconBg="#f0fdf4"
            iconColor="#16a34a"
          />
          <MetricCard
            label={`Студентов записалось ${PERIOD_LABEL[period]}`}
            value={studentsBookedInPeriod}
            icon={<CheckCircle2 size={22} />}
            iconBg="#fffbeb"
            iconColor="#d97706"
          />
        </div>
      </div>

      {/* ── Two-column area ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: 20,
        alignItems: 'start',
      }}>

        {/* ── Sessions table ── */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8ecf0',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
        }}>
          {/* Table header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '16px 18px',
            borderBottom: '1px solid #e8ecf0',
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
              Ближайшие занятия
            </span>
            <Link
              href="/calendar"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                color: '#64748b', fontSize: '0.8rem',
                textDecoration: 'none', fontWeight: 500,
              }}
            >
              <Calendar size={14} />
              Календарь
            </Link>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Студент</th>
                <th style={{ ...thStyle, width: 80 }}>Группа</th>
                <th style={{ ...thStyle, width: 150 }}>Статус</th>
                <th style={{ ...thStyle, width: 130 }}>Время</th>
                <th style={{ ...thStyle, width: 130 }}>Кабинет</th>
              </tr>
            </thead>
            <tbody>
              {apptLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((__, j) => (
                      <td key={j} style={tdStyle}>
                        <div style={{
                          height: 13, borderRadius: 4, background: '#f1f5f9',
                          width: j === 0 ? 140 : 70,
                        }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{
                    ...tdStyle, textAlign: 'center',
                    color: '#94a3b8', padding: '48px 0',
                  }}>
                    Нет предстоящих записей
                  </td>
                </tr>
              ) : (
                sessions.map((appt) => {
                  const sm = STATUS_META[appt.status] ?? STATUS_META.pending;
                  const studentName = appt.student_name ?? `Студент ${appt.student_id.slice(0, 6)}…`;
                  const [datePart, timePart] = formatSlotTime(appt.slot_start_time, appt.slot_end_time);

                  return (
                    <tr
                      key={appt.id}
                      style={{ transition: 'background 100ms' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      {/* Student */}
                      <td style={tdStyle}>
                        <Link
                          href={`/students/${appt.student_id}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}
                        >
                          {appt.student_avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={appt.student_avatar_url}
                              alt={studentName}
                              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                              color: '#fff', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700,
                            }}>
                              {getInitials(studentName)}
                            </div>
                          )}
                          <span style={{ fontWeight: 500 }}>{studentName}</span>
                        </Link>
                      </td>

                      {/* Group */}
                      <td style={{ ...tdStyle, color: '#2563eb', fontWeight: 600 }}>
                        {studentMap[appt.student_id]?.group || '—'}
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 9999,
                          fontSize: '0.75rem', fontWeight: 600,
                          background: sm.bg, color: sm.color,
                        }}>
                          {sm.label}
                        </span>
                      </td>

                      {/* Time */}
                      <td style={{ ...tdStyle, fontSize: '0.8rem' }}>
                        <div style={{ color: '#475569' }}>{datePart}</div>
                        {timePart && (
                          <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 1 }}>
                            {timePart}
                          </div>
                        )}
                      </td>

                      {/* Type / Cabinet */}
                      <td style={{ ...tdStyle, fontSize: '0.8rem', color: '#64748b' }}>
                        {TYPE_LABEL[appt.consultation_type] ?? appt.consultation_type}
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
          <div style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e8ecf0',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
          }}>
            <div style={{
              padding: '12px 18px',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              borderBottom: '1px solid #f1f5f9',
            }}>
              Ближайшая консультация
            </div>

            {nextAppointment ? (
              <div style={{ padding: '16px 18px' }}>
                {/* Timer row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: '#eff6ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', flexShrink: 0,
                  }}>
                    ⏱
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                      {formatTimeUntil(nextAppointment.slot_start_time)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                      {nextAppointment.student_name ?? `Студент ${nextAppointment.student_id.slice(0, 8)}`}
                      {' — '}
                      {TYPE_LABEL[nextAppointment.consultation_type] ?? 'Консультация'}
                    </div>
                  </div>
                </div>

                {/* CTA button */}
                <Link
                  href={`/students/${nextAppointment.student_id}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '11px 0',
                    textAlign: 'center',
                    borderRadius: 10,
                    background: '#0f172a',
                    color: '#fff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Подготовиться к встрече
                </Link>
              </div>
            ) : (
              <div style={{
                padding: '32px 18px',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.85rem',
              }}>
                Нет предстоящих консультаций
              </div>
            )}
          </div>

          {/* Tasks panel */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e8ecf0',
            padding: '16px 18px',
            boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 14,
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                Задачи на сегодня
              </span>
              <span style={{
                background: '#f1f5f9', color: '#475569', borderRadius: 9999,
                fontSize: '0.72rem', fontWeight: 600, padding: '2px 10px',
              }}>
                {appointments.filter((a) => a.status === 'completed').length}
                {'/'}
                {appointments.filter((a) => a.status !== 'cancelled').length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {appointments
                .filter((a) => a.status !== 'cancelled')
                .slice(0, 5)
                .map((appt) => {
                  const done = appt.status === 'completed';
                  const canComplete = appt.status === 'confirmed' || appt.status === 'pending';
                  return (
                    <div
                      key={appt.id}
                      onClick={() => {
                        if (canComplete && !completeAppt.isPending) {
                          completeAppt.mutate(appt.id);
                        }
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        cursor: canComplete ? 'pointer' : 'default',
                        borderRadius: 7,
                        padding: '3px 4px',
                        transition: 'background 100ms',
                      }}
                      onMouseEnter={(e) => {
                        if (canComplete) e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                    >
                      {/* Checkbox */}
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        border: done ? 'none' : '1.5px solid #cbd5e1',
                        background: done ? '#2563eb' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 150ms, border 150ms',
                      }}>
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

                      <span style={{
                        fontSize: '0.8rem',
                        color: done ? '#94a3b8' : '#1e293b',
                        textDecoration: done ? 'line-through' : 'none',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {appt.student_name
                          ? `Встреча со студентом ${appt.student_name}`
                          : `Консультация · ${TYPE_LABEL[appt.consultation_type] ?? appt.consultation_type}`}
                      </span>
                    </div>
                  );
                })}

              {appointments.filter((a) => a.status !== 'cancelled').length === 0 && (
                <div style={{
                  textAlign: 'center', padding: '16px 0',
                  color: '#94a3b8', fontSize: '0.8rem',
                }}>
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
