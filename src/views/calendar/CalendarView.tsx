'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCalendar, useDeleteCalendarEvent } from '@/hooks/useCalendar';
import { CalendarEventModal } from '@/components/calendar/CalendarEventModal';
import type { CalendarEventOut } from '@/types/api';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';
import { ru } from 'date-fns/locale';

const EVENT_TYPE_LABELS: Record<string, string> = {
  task_deadline: 'Дедлайн',
  appointment: 'Встреча',
  custom: 'Событие',
  reminder: 'Напоминание',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  task_deadline: '#ef4444',
  appointment: '#8b5cf6',
  custom: '#2563eb',
  reminder: '#f59e0b',
};

function getEventColor(ev: CalendarEventOut) {
  return ev.color || EVENT_TYPE_COLORS[ev.event_type] || '#2563eb';
}

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

const weekdayStyle: CSSProperties = {
  textAlign: 'center',
  fontWeight: '600',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
  paddingBottom: 'var(--space-2)',
  borderBottom: '1px solid var(--color-border)',
};

const dayStyle = (isCurrentMonth: boolean, isToday: boolean, isSelected: boolean): CSSProperties => ({
  padding: 'var(--space-3)',
  minHeight: '100px',
  borderRadius: 'var(--radius-md)',
  border: isSelected ? '2px solid #2563eb' : '1px solid var(--color-border)',
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

export default function CalendarPage() {
  const { data: events } = useCalendar();
  const deleteEvent = useDeleteCalendarEvent();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDefaultDate, setCreateDefaultDate] = useState<string | undefined>();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const leadingEmpty = (getDay(monthStart) + 6) % 7;

  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const selectedDayEvents: CalendarEventOut[] = selectedDay
    ? (events ?? []).filter((e) => isSameDay(new Date(e.start_time), selectedDay))
    : [];

  const handleDayClick = (date: Date) => {
    setSelectedDay((prev) => (prev && isSameDay(prev, date) ? null : date));
  };

  const handleAddEvent = () => {
    setCreateDefaultDate(
      selectedDay ? format(selectedDay, 'yyyy-MM-dd') : undefined
    );
    setShowCreateModal(true);
  };

  const handleDelete = (ev: CalendarEventOut) => {
    if (window.confirm(`Удалить событие «${ev.title}»?`)) {
      deleteEvent.mutate(ev.id);
    }
  };

  return (
    <div style={pageContainerStyle}>
      <PageHeader
        title="Календарь"
        subtitle="Просмотрите события и управляйте расписанием"
        action={
          <button
            type="button"
            onClick={handleAddEvent}
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
          <button style={navButtonStyle} onClick={() => setCurrentDate(subMonths(currentDate, 1))} title="Предыдущий месяц">
            <ChevronLeft size={20} />
          </button>
          <button style={navButtonStyle} onClick={() => setCurrentDate(addMonths(currentDate, 1))} title="Следующий месяц">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Main content: calendar + side panel */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Calendar grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 'var(--space-2)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Weekday headers */}
            {weekdays.map((day) => (
              <div key={day} style={weekdayStyle}>{day}</div>
            ))}

            {/* Leading empty cells */}
            {Array.from({ length: leadingEmpty }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days */}
            {daysInMonth.map((date) => {
              const isToday = isSameDay(date, new Date());
              const isSelected = selectedDay ? isSameDay(date, selectedDay) : false;
              const dayEvents = (events ?? []).filter((e) => isSameDay(new Date(e.start_time), date));

              return (
                <div
                  key={date.toISOString()}
                  style={dayStyle(true, isToday, isSelected)}
                  onClick={() => handleDayClick(date)}
                >
                  <div style={dayNumberStyle}>
                    {format(date, 'd')}
                  </div>
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        fontSize: '0.7rem',
                        background: getEventColor(ev),
                        color: '#fff',
                        borderRadius: 4,
                        padding: '2px 5px',
                        marginTop: 2,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel — shown when a day is selected */}
        {selectedDay && (
          <div
            style={{
              width: 320,
              flexShrink: 0,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
            }}
          >
            {/* Panel header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', textTransform: 'capitalize' }}>
                  {format(selectedDay, 'EEEE, d MMMM', { locale: ru })}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                  {selectedDayEvents.length > 0
                    ? `${selectedDayEvents.length} событий`
                    : 'Нет событий'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={handleAddEvent}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 11px',
                    borderRadius: 7,
                    border: 'none',
                    background: '#2563eb',
                    color: '#fff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={13} />
                  Добавить
                </button>
                <button
                  onClick={() => setSelectedDay(null)}
                  style={{
                    background: 'none',
                    border: '1px solid #e2e8f0',
                    borderRadius: 7,
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 7px',
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Events list */}
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
              {selectedDayEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📅</div>
                  <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: 4 }}>
                    Нет событий
                  </div>
                  <div style={{ fontSize: '0.77rem' }}>
                    Нажмите «Добавить», чтобы создать событие
                  </div>
                </div>
              ) : (
                [...selectedDayEvents]
                  .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                  .map((ev) => {
                    const color = getEventColor(ev);
                    const typeLabel = EVENT_TYPE_LABELS[ev.event_type] ?? ev.event_type;
                    return (
                      <div
                        key={ev.id}
                        style={{
                          display: 'flex',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: '1px solid #f1f5f9',
                          background: '#fafafa',
                        }}
                      >
                        {/* Color bar */}
                        <div style={{ width: 3, borderRadius: 4, background: color, flexShrink: 0 }} />

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.83rem', color: '#0f172a' }}>
                              {ev.title}
                            </span>
                            <span
                              style={{
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                color: color,
                                background: `${color}18`,
                                borderRadius: 4,
                                padding: '2px 5px',
                                flexShrink: 0,
                              }}
                            >
                              {typeLabel}
                            </span>
                          </div>

                          {ev.description && (
                            <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: 5, lineHeight: 1.4 }}>
                              {ev.description}
                            </div>
                          )}

                          <div style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                            🕐 {format(new Date(ev.start_time), 'HH:mm', { locale: ru })}
                            {ev.end_time && <> — {format(new Date(ev.end_time), 'HH:mm', { locale: ru })}</>}
                            {ev.all_day && <span style={{ marginLeft: 4 }}>· Весь день</span>}
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(ev)}
                          disabled={deleteEvent.isPending}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: deleteEvent.isPending ? 'not-allowed' : 'pointer',
                            color: '#cbd5e1',
                            padding: 2,
                            borderRadius: 5,
                            display: 'flex',
                            alignItems: 'flex-start',
                            flexShrink: 0,
                            transition: 'color 120ms ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
