'use client';

import { useEffect, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useOverviewReport } from '@/hooks/useReports';
import { useStudents } from '@/hooks/useStudents';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useAppointments, useSlots } from '@/hooks/useAppointments';
import { useCalendarEvents } from '@/hooks/useCalendar';
import { formatGroup } from '@/lib/formatGroup';

const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-5)',
  boxShadow: 'var(--shadow-sm)',
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 'var(--text-lg)',
  fontWeight: '600',
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-4)',
};

const metricLabelStyle: CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--text-xs)',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 'var(--space-2)',
};

const metricValueStyle: CSSProperties = {
  fontSize: 'var(--text-3xl)',
  fontWeight: '700',
  color: 'var(--color-text-primary)',
};

const trendTextStyle = (isPositive: boolean): CSSProperties => ({
  fontSize: 'var(--text-xs)',
  fontWeight: '500',
  color: isPositive ? 'var(--color-success, #10b981)' : 'var(--color-error, #ef4444)',
  marginTop: 'var(--space-2)',
});

const formatNumber = (value?: number | null) =>
  typeof value === 'number' ? value.toLocaleString('en-US') : '—';

const formatCurrency = (value?: number | null) => {
  if (typeof value !== 'number') return '—';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

// helpers for date ranges
function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function todayEndISO() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}
function weekEndISO() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const overview = useOverviewReport();
  const students = useStudents({ page: 1, page_size: 5, sort_by: 'gpa' });
  const { data: unreadCount } = useUnreadNotificationCount();

  // new operational metrics
  const { data: allAppointments } = useAppointments();
  const { data: allSlots } = useSlots({ from_time: todayISO() });
  const { data: tasksToday } = useCalendarEvents({ from: todayISO(), to: todayEndISO(), event_type: 'task_deadline' });
  const { data: deadlinesWeek } = useCalendarEvents({ from: todayISO(), to: weekEndISO(), event_type: 'task_deadline' });

  const isToday = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
  };

  const appointmentsToday = (allAppointments ?? []).filter((a) =>
    a.slot_start_time ? isToday(a.slot_start_time) : false
  );

  const slotsToday = (allSlots ?? []).filter((s) =>
    s.start_time ? isToday(s.start_time) : false
  );

  // Error toasts for read queries (mutations already toast via hooks)
  useEffect(() => {
    if (overview.isError) toast.error('Не удалось загрузить отчёт');
  }, [overview.isError]);

  useEffect(() => {
    if (students.isError) toast.error('Не удалось загрузить список студентов');
  }, [students.isError]);

  const report = overview.data;

  // Calculate engagement: IELTS passed + SAT passed as "active"
  const ielts_sat_passed = (report?.ielts_passed ?? 0) + (report?.sat_passed ?? 0);
  const total_students = report?.total_students ?? 1;
  const engagement_inactive = Math.max(0, total_students - ielts_sat_passed);

  const engagementData = [
    {
      name: t('activeStudents'),
      value: ielts_sat_passed,
    },
    {
      name: t('inactiveStudents'),
      value: engagement_inactive,
    },
  ];

  const totalEngagement = ielts_sat_passed + engagement_inactive;
  const engagementPercent =
    totalEngagement > 0
      ? Math.round((ielts_sat_passed / totalEngagement) * 100)
      : 0;

  const studentItems = Array.isArray(students.data)
    ? students.data
    : Array.isArray(students.data?.data)
    ? students.data.data
    : [];

  const metricCards = [
    {
      label: 'ВСЕГО УЧАЩИХСЯ',
      value: formatNumber(report?.total_students),
      sub: 'студентов в работе',
      icon: '🎓',
    },
    {
      label: 'ВСТРЕЧ СЕГОДНЯ',
      value: `${appointmentsToday.length} / ${slotsToday.length}`,
      sub: 'забронировано / всего слотов',
      icon: '📅',
    },
    {
      label: 'ЗАДАЧ СЕГОДНЯ',
      value: String((tasksToday ?? []).length),
      sub: 'дедлайн сегодня',
      icon: '✅',
    },
    {
      label: 'ДЕДЛАЙНОВ НА НЕДЕЛЕ',
      value: String((deadlinesWeek ?? []).length),
      sub: 'ближайшие 7 дней',
      icon: '⏰',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          typeof unreadCount === 'number' && unreadCount > 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                fontSize: '0.85rem',
                color: '#1d4ed8',
                fontWeight: 500,
              }}
            >
              <Bell size={15} />
              {unreadCount} непрочитанных уведомлений
            </div>
          ) : undefined
        }
      />

      {/* Key Metrics Section */}
      <section>
        <h2 style={sectionTitleStyle}>{t('keyMetrics')}</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {metricCards.map((card) => (
            <div
              key={card.label}
              style={{
                ...cardStyle,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={metricLabelStyle}>{card.label}</div>
                <span style={{ fontSize: 20 }}>{card.icon}</span>
              </div>
              <div style={metricValueStyle}>
                {overview.isLoading ? '...' : card.value}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                {card.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Results and Engagement Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Best Results by Offers */}
        <section style={cardStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div>
              <h2 style={{ ...sectionTitleStyle, marginBottom: 0 }}>
                {t('bestResultsByOffers')}
              </h2>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                топ 5 по GPA
              </div>
            </div>
            <Link
              href="/students"
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              {t('select')}
            </Link>
          </div>

          {students.isLoading ? (
            <div style={{ color: 'var(--color-text-secondary)' }}>
              {t('loadingStudents')}
            </div>
          ) : studentItems.length === 0 ? (
            <div style={{ color: 'var(--color-text-secondary)' }}>
              {t('noStudents')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <th
                      style={{
                        textAlign: 'left',
                        padding: 'var(--space-2) 0',
                        color: 'var(--color-text-secondary)',
                        fontWeight: '500',
                        fontSize: 'var(--text-xs)',
                      }}
                    >
                      {t('studentName')}
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: 'var(--space-2) var(--space-3)',
                        color: 'var(--color-text-secondary)',
                        fontWeight: '500',
                        fontSize: 'var(--text-xs)',
                      }}
                    >
                      Группа
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: 'var(--space-2) var(--space-3)',
                        color: 'var(--color-text-secondary)',
                        fontWeight: '500',
                        fontSize: 'var(--text-xs)',
                      }}
                    >
                      GPA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentItems.map((student) => (
                    <tr
                      key={student.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      <td
                        style={{
                          padding: 'var(--space-3) 0',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {student.full_name}
                      </td>
                      <td
                        style={{
                          padding: 'var(--space-3) var(--space-3)',
                          color: 'var(--color-text-secondary)',
                          fontSize: 'var(--text-xs)',
                        }}
                      >
                        {formatGroup(student.group_type, student.course_year) ?? '—'}
                      </td>
                      <td
                        style={{
                          padding: 'var(--space-3) var(--space-3)',
                          color: 'var(--color-text-secondary)',
                          fontSize: 'var(--text-xs)',
                        }}
                      >
                        {student.gpa?.toFixed(2) ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 'var(--space-4)' }}>
            <Link
              href="/students"
              style={{
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
              }}
            >
              {t('viewAll')}
            </Link>
          </div>
        </section>

        {/* Engagement Section */}
        <section style={cardStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-4)',
            }}
          >
            <h2 style={{ ...sectionTitleStyle, marginBottom: 0 }}>
              {t('engagement')}
            </h2>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
              }}
            >
              ℹ
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              {overview.isLoading ? (
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  {t('loading')}
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={engagementData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        dataKey="value"
                        startAngle={90}
                        endAngle={450}
                      >
                        <Cell fill="var(--color-primary, #ff6b35)" />
                        <Cell fill="var(--color-accent, #ffd54f)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center percentage */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: '700',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {engagementPercent}%
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {t('ofGoals')}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Legend */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-6)',
                justifyContent: 'center',
              }}
            >
              {engagementData.map((item, index) => (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '2px',
                      background:
                        index === 0
                          ? 'var(--color-primary, #ff6b35)'
                          : 'var(--color-accent, #ffd54f)',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {item.name}: <strong>{item.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
