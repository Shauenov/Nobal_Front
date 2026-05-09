'use client';

import { format } from 'date-fns';
import type { CSSProperties } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { useOverviewReport } from '@/hooks/useReports';
import { useStudents } from '@/hooks/useStudents';
import { useMyAppointments } from '@/hooks/useAppointments';
import { useCalendarEvents } from '@/hooks/useCalendar';

const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  boxShadow: 'var(--shadow-sm)',
};

const labelStyle: CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-semibold)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const valueStyle: CSSProperties = {
  fontSize: 'var(--text-2xl)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-primary)',
};

const formatNumber = (value?: number | null) =>
  typeof value === 'number' ? value.toLocaleString() : '—';

const safeDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'MMM d, HH:mm');
};

const unwrapItems = <T,>(payload: unknown): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (typeof payload === 'object' && payload !== null && 'items' in payload) {
    const items = (payload as { items?: T[] }).items;
    return Array.isArray(items) ? items : [];
  }
  return [];
};

export default function DashboardPage() {
  const overview = useOverviewReport();
  const students = useStudents({ page: 1, page_size: 5 });
  const appointments = useMyAppointments();
  const calendar = useCalendarEvents({ from: new Date().toISOString() });

  const report = overview.data;
  const studentItems = unwrapItems(students.data?.data);
  const appointmentItems = unwrapItems(appointments.data?.data);
  const eventItems = unwrapItems(calendar.data?.data);

  const groupData = Object.entries(report?.by_group ?? {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader title="Dashboard" subtitle="Overview of your student portfolio" />

      <section
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        }}
      >
        {[
          { label: 'Total Students', value: report?.total_students },
          { label: 'IELTS Passed', value: report?.ielts_passed },
          { label: 'SAT Passed', value: report?.sat_passed },
          { label: 'Average GPA', value: report?.avg_gpa },
          { label: 'Tasks (Month)', value: report?.tasks_completed_this_month },
          { label: 'Appointments (Month)', value: report?.appointments_this_month },
        ].map((item) => (
          <div key={item.label} style={cardStyle}>
            <div style={labelStyle}>{item.label}</div>
            <div style={valueStyle}>
              {overview.isLoading ? '...' : formatNumber(item.value)}
            </div>
          </div>
        ))}
      </section>

      <section
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={labelStyle}>Students by Group</div>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
              Applied abroad: {formatNumber(report?.applied_abroad)}
            </span>
          </div>
          <div style={{ height: 220, marginTop: 'var(--space-4)' }}>
            {overview.isLoading ? (
              <div style={{ color: 'var(--color-text-secondary)' }}>Loading chart...</div>
            ) : groupData.length === 0 ? (
              <div style={{ color: 'var(--color-text-secondary)' }}>No data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={groupData}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {groupData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {groupData.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              {groupData.map((entry, index) => (
                <div
                  key={entry.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 'var(--radius-full)',
                      background: index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)',
                    }}
                  />
                  {entry.name}: {entry.value}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Recent Students</div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            {students.isLoading ? (
              <div style={{ color: 'var(--color-text-secondary)' }}>Loading students...</div>
            ) : studentItems.length === 0 ? (
              <div style={{ color: 'var(--color-text-secondary)' }}>No students yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--color-text-disabled)' }}>
                    <th style={{ paddingBottom: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                      Name
                    </th>
                    <th style={{ paddingBottom: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                      GPA
                    </th>
                    <th style={{ paddingBottom: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                      Tasks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentItems.map((student) => (
                    <tr key={student.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 'var(--space-2) 0' }}>{student.full_name}</td>
                      <td style={{ padding: 'var(--space-2) 0', color: 'var(--color-text-secondary)' }}>
                        {student.gpa ?? '—'}
                      </td>
                      <td style={{ padding: 'var(--space-2) 0', color: 'var(--color-text-secondary)' }}>
                        {student.tasks_done}/{student.tasks_total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Upcoming Appointments</div>
          <div style={{ marginTop: 'var(--space-3)', display: 'grid', gap: 'var(--space-3)' }}>
            {appointments.isLoading ? (
              <div style={{ color: 'var(--color-text-secondary)' }}>Loading appointments...</div>
            ) : appointmentItems.length === 0 ? (
              <div style={{ color: 'var(--color-text-secondary)' }}>No upcoming appointments.</div>
            ) : (
              appointmentItems.slice(0, 5).map((appointment) => (
                <div key={appointment.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 'var(--text-sm)' }}>
                    Student ID: {appointment.student_id.slice(-6)}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    Status: {appointment.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Upcoming Events</div>
          <div style={{ marginTop: 'var(--space-3)', display: 'grid', gap: 'var(--space-3)' }}>
            {calendar.isLoading ? (
              <div style={{ color: 'var(--color-text-secondary)' }}>Loading events...</div>
            ) : eventItems.length === 0 ? (
              <div style={{ color: 'var(--color-text-secondary)' }}>No upcoming events.</div>
            ) : (
              eventItems.slice(0, 5).map((event) => (
                <div key={event.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 'var(--text-sm)' }}>{event.title}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    {safeDate(event.start_time)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
