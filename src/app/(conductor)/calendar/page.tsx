'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCalendar } from '@/hooks/useCalendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

const pageContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-6)',
};

const calendarHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 'var(--space-4)',
  paddingBottom: 'var(--space-4)',
  borderBottom: '1px solid var(--color-border)',
};

const navButtonStyle: CSSProperties = {
  padding: 'var(--space-2)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-text-primary)',
  transition: 'all 150ms ease',
};

const monthYearStyle: CSSProperties = {
  fontSize: 'var(--text-lg)',
  fontWeight: '600',
  color: 'var(--color-text-primary)',
};

const calendarGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 'var(--space-2)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  boxShadow: 'var(--shadow-sm)',
};

const weekdayStyle: CSSProperties = {
  textAlign: 'center',
  fontWeight: '600',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
  paddingBottom: 'var(--space-2)',
  borderBottom: '1px solid var(--color-border)',
};

const dayStyle = (isCurrentMonth: boolean, isToday: boolean): CSSProperties => ({
  padding: 'var(--space-3)',
  minHeight: '100px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: isToday ? 'var(--color-primary)' : isCurrentMonth ? 'white' : 'var(--color-surface-hover)',
  color: isToday ? 'white' : 'var(--color-text-primary)',
  cursor: isCurrentMonth ? 'pointer' : 'default',
  transition: 'all 150ms ease',
});

const dayNumberStyle: CSSProperties = {
  fontWeight: '600',
  fontSize: 'var(--text-sm)',
  marginBottom: 'var(--space-1)',
};

const emptyStateStyle: CSSProperties = {
  textAlign: 'center',
  padding: 'var(--space-8) var(--space-4)',
  color: 'var(--color-text-secondary)',
};

export default function CalendarPage() {
  const { data: events } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div style={pageContainerStyle}>
      <PageHeader
        title="Календарь"
        subtitle="Просмотрите события и управляйте расписанием"
      />

      <div style={calendarHeaderStyle}>
        <h2 style={monthYearStyle}>
          {format(currentDate, 'LLLL yyyy', { locale: ru })}
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button style={navButtonStyle} onClick={handlePrevMonth} title="Предыдущий месяц">
            <ChevronLeft size={20} />
          </button>
          <button style={navButtonStyle} onClick={handleNextMonth} title="Следующий месяц">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div style={calendarGridStyle}>
        {/* Weekday headers */}
        {weekdays.map((day) => (
          <div key={day} style={weekdayStyle}>
            {day}
          </div>
        ))}

        {/* Days */}
        {daysInMonth.map((date) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(date, new Date());
          const dayEvents = events?.filter((e) => isSameDay(new Date(e.start_time), date)) || [];

          return (
            <div key={date.toISOString()} style={dayStyle(isCurrentMonth, isToday)}>
              <div style={dayNumberStyle}>
                {format(date, 'd')}
              </div>
              {dayEvents.length > 0 && (
                <div style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>
                  <div style={{ color: 'var(--color-primary)', fontWeight: '500' }}>
                    {dayEvents.length} событи{dayEvents.length === 1 ? 'е' : 'й'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!events || events.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ fontSize: 'var(--text-lg)', margin: 'var(--space-2) 0' }}>
            Нет событий
          </p>
          <p style={{ fontSize: 'var(--text-sm)', margin: 0 }}>
            Создайте первое событие, нажав кнопку выше
          </p>
        </div>
      ) : null}
    </div>
  );
}
