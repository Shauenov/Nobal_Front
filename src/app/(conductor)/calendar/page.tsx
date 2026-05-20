'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCalendar, useDeleteCalendarEvent } from '@/hooks/useCalendar';
import { CalendarEventModal } from '@/components/calendar/CalendarEventModal';
import type { CalendarEventOut } from '@/types/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
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
  position: 'relative',
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

interface EventPopoverProps {
  event: CalendarEventOut;
  onClose: () => void;
}

function EventPopover({ event, onClose }: EventPopoverProps) {
  const deleteEvent = useDeleteCalendarEvent();

  const handleDelete = () => {
    if (window.confirm(`Удалить событие «${event.title}»?`)) {
      deleteEvent.mutate(event.id, { onSuccess: onClose });
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 200,
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        boxShadow: '0 8px 24px rgba(15,23,42,0.15)',
        padding: '12px 14px',
        minWidth: 200,
        marginTop: 4,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b', marginBottom: 4 }}>
        {event.title}
      </div>
      {event.description && (
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 8 }}>
          {event.description}
        </div>
      )}
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 10 }}>
        {format(new Date(event.start_time), 'HH:mm', { locale: ru })}
        {event.end_time ? ` — ${format(new Date(event.end_time), 'HH:mm', { locale: ru })}` : ''}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{ padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', fontSize: '0.75rem', cursor: 'pointer', color: '#475569' }}
        >
          Закрыть
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteEvent.isPending}
          style={{ padding: '5px 10px', border: '1px solid #fecaca', borderRadius: 6, background: '#fff', fontSize: '0.75rem', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Trash2 size={12} />
          Удалить
        </button>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { data: events } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDefaultDate, setCreateDefaultDate] = useState<string | undefined>();
  const [openPopoverEventId, setOpenPopoverEventId] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  // Leading empty cells so the first day lands on the correct weekday column
  // (Monday-first grid: Mon=0, Tue=1, … Sun=6)
  const leadingEmpty = (getDay(monthStart) + 6) % 7;

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDayClick = (date: Date) => {
    setCreateDefaultDate(format(date, 'yyyy-MM-dd'));
    setShowCreateModal(true);
  };

  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div style={pageContainerStyle}>
      <PageHeader
        title="Календарь"
        subtitle="Просмотрите события и управляйте расписанием"
        action={
          <button
            type="button"
            onClick={() => { setCreateDefaultDate(undefined); setShowCreateModal(true); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={15} />
            Добавить событие
          </button>
        }
      />

      {showCreateModal && (
        <CalendarEventModal
          defaultDate={createDefaultDate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

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

        {/* Leading empty cells */}
        {Array.from({ length: leadingEmpty }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days */}
        {daysInMonth.map((date) => {
          const isToday = isSameDay(date, new Date());
          const dayEvents = events?.filter((e) => isSameDay(new Date(e.start_time), date)) || [];

          return (
            <div
              key={date.toISOString()}
              style={dayStyle(true, isToday)}
              onClick={() => handleDayClick(date)}
            >
              <div style={dayNumberStyle}>
                {format(date, 'd')}
              </div>
              {dayEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenPopoverEventId(openPopoverEventId === ev.id ? null : ev.id);
                  }}
                  style={{
                    fontSize: '0.7rem',
                    background: ev.color || '#2563eb',
                    color: '#fff',
                    borderRadius: 4,
                    padding: '2px 5px',
                    marginTop: 2,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    position: 'relative',
                  }}
                >
                  {ev.title}
                  {openPopoverEventId === ev.id && (
                    <EventPopover
                      event={ev}
                      onClose={() => setOpenPopoverEventId(null)}
                    />
                  )}
                </div>
              ))}
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
