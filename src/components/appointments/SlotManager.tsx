'use client';

import { useState, useMemo } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths,
  addMinutes, isToday,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock, X } from 'lucide-react';
import { useSlots, useCreateSlot, useDeleteSlot } from '@/hooks/useAppointments';
import type { SlotOut } from '@/types/api';

/* ─── Conflict check ─────────────────────────────────────────── */
function hasConflict(newStart: Date, newEnd: Date, slots: SlotOut[]): boolean {
  return slots.some((s) => {
    const sStart = new Date(s.start_time);
    const sEnd   = new Date(s.end_time);
    return newStart < sEnd && newEnd > sStart;
  });
}

/* ─── Day-of-week header labels (Mon-Sun) ──────────────────────── */
const DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/* ─── SlotManager ────────────────────────────────────────────── */
export function SlotManager() {
  const { data: allSlots = [], isLoading } = useSlots();
  const createSlot = useCreateSlot();
  const deleteSlot = useDeleteSlot();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  /* Form state for the day panel */
  const [timeInput, setTimeInput] = useState('09:00');
  const [duration, setDuration] = useState(45);

  /* Calendar grid: Mon → Sun rows */
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end   = endOfWeek(endOfMonth(currentMonth),     { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  /* Slots grouped by ISO date string */
  const slotsByDate = useMemo(() => {
    const map: Record<string, SlotOut[]> = {};
    for (const s of allSlots) {
      const key = format(new Date(s.start_time), 'yyyy-MM-dd');
      (map[key] ??= []).push(s);
    }
    return map;
  }, [allSlots]);

  /* Slots for the selected day */
  const daySlots = useMemo(() => {
    if (!selectedDay) return [];
    return slotsByDate[format(selectedDay, 'yyyy-MM-dd')] ?? [];
  }, [selectedDay, slotsByDate]);

  /* Create slot handler */
  const handleCreate = () => {
    if (!selectedDay || !timeInput) return;
    const [h, m] = timeInput.split(':').map(Number);
    const start = new Date(selectedDay);
    start.setHours(h, m, 0, 0);
    const end = addMinutes(start, duration);

    if (hasConflict(start, end, daySlots)) return; // blocked in UI, but guard here too

    createSlot.mutate({
      start_time: start.toISOString(),
      end_time:   end.toISOString(),
      duration_min: duration,
    });
  };

  /* Conflict check for current form values */
  const conflictError = useMemo(() => {
    if (!selectedDay || !timeInput) return null;
    const [h, m] = timeInput.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    const start = new Date(selectedDay);
    start.setHours(h, m, 0, 0);
    const end = addMinutes(start, duration);
    return hasConflict(start, end, daySlots)
      ? 'Это время пересекается с существующим слотом'
      : null;
  }, [selectedDay, timeInput, duration, daySlots]);

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

      {/* ── Calendar ── */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        border: '1px solid #e8ecf0',
        padding: '20px 22px',
        boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
        flex: '0 0 auto',
        width: 380,
      }}>
        {/* Month navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, borderRadius: 6, display: 'flex' }}
          >
            <ChevronLeft size={18} />
          </button>

          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', textTransform: 'capitalize' }}>
            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
          </span>

          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, borderRadius: 6, display: 'flex' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day-of-week header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
          {DOW.map((d) => (
            <div key={d} style={{
              textAlign: 'center', fontSize: '0.72rem', fontWeight: 600,
              color: '#94a3b8', padding: '4px 0',
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {calendarDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const slotCount = slotsByDate[key]?.length ?? 0;
            const inMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
            const today = isToday(day);

            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedDay(day);
                  setTimeInput('09:00');
                  setDuration(45);
                }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 40,
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: isSelected
                    ? '#0f172a'
                    : today
                    ? '#eff6ff'
                    : 'transparent',
                  color: isSelected
                    ? '#fff'
                    : !inMonth
                    ? '#cbd5e1'
                    : today
                    ? '#2563eb'
                    : '#1e293b',
                  fontWeight: isSelected || today ? 700 : 400,
                  fontSize: '0.85rem',
                  transition: 'background 120ms',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = today ? '#eff6ff' : 'transparent';
                }}
              >
                {format(day, 'd')}
                {/* Slot dot indicator */}
                {slotCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    bottom: 5,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: isSelected ? '#93c5fd' : '#2563eb',
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ marginTop: 14, display: 'flex', gap: 14, fontSize: '0.72rem', color: '#94a3b8' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
            Есть слоты
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#0f172a', display: 'inline-block' }} />
            Выбранный день
          </span>
        </div>
      </div>

      {/* ── Day panel ── */}
      {selectedDay ? (
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8ecf0',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
        }}>
          {/* Panel header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', textTransform: 'capitalize' }}>
                {format(selectedDay, 'EEEE, d MMMM', { locale: ru })}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                {daySlots.length > 0
                  ? `${daySlots.length} слот${daySlots.length === 1 ? '' : daySlots.length < 5 ? 'а' : 'ов'}`
                  : 'Нет слотов'}
              </div>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 4, borderRadius: 6 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Existing slots for this day */}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isLoading ? (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Загрузка...</div>
            ) : daySlots.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '24px 0',
                color: '#94a3b8', fontSize: '0.85rem',
              }}>
                В этот день нет слотов
              </div>
            ) : (
              daySlots
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((slot) => {
                  const start = new Date(slot.start_time);
                  const end   = new Date(slot.end_time);
                  return (
                    <div key={slot.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: `1px solid ${slot.is_available ? '#e0f2fe' : '#fee2e2'}`,
                      background: slot.is_available ? '#f0f9ff' : '#fff5f5',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Clock size={14} color={slot.is_available ? '#0284c7' : '#dc2626'} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>
                            {format(start, 'HH:mm')} — {format(end, 'HH:mm')}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 1 }}>
                            {slot.duration_min} мин ·{' '}
                            <span style={{ color: slot.is_available ? '#0284c7' : '#dc2626', fontWeight: 600 }}>
                              {slot.is_available ? 'Свободен' : 'Занят'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {slot.is_available && (
                        <button
                          onClick={() => deleteSlot.mutate(slot.id)}
                          disabled={deleteSlot.isPending}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#ef4444', display: 'flex', padding: 6, borderRadius: 7,
                            opacity: deleteSlot.isPending ? 0.5 : 1,
                          }}
                          title="Удалить слот"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  );
                })
            )}
          </div>

          {/* Add slot form */}
          <div style={{
            margin: '0 20px 20px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: 12,
            border: '1px solid #e8ecf0',
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={15} />
              Добавить слот
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              {/* Time picker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Время начала</label>
                <input
                  type="time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${conflictError ? '#fca5a5' : '#e2e8f0'}`,
                    background: '#fff',
                    color: '#1e293b',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Duration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Длительность (мин)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #e2e8f0',
                    background: '#fff',
                    color: '#1e293b',
                    fontSize: '0.875rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value={30}>30 мин</option>
                  <option value={45}>45 мин</option>
                  <option value={60}>60 мин</option>
                  <option value={90}>90 мин</option>
                  <option value={120}>120 мин</option>
                </select>
              </div>

              {/* End time preview */}
              {timeInput && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Конец</label>
                  <div style={{
                    padding: '8px 12px', borderRadius: 8,
                    border: '1.5px solid #e2e8f0', background: '#f1f5f9',
                    color: '#64748b', fontSize: '0.875rem', minWidth: 70,
                  }}>
                    {(() => {
                      const [h, m] = timeInput.split(':').map(Number);
                      if (isNaN(h) || isNaN(m)) return '—';
                      const end = addMinutes(new Date(selectedDay!).setHours(h, m, 0, 0), duration);
                      return format(new Date(end), 'HH:mm');
                    })()}
                  </div>
                </div>
              )}

              {/* Create button */}
              <button
                onClick={handleCreate}
                disabled={createSlot.isPending || !!conflictError || !timeInput}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: conflictError ? '#f1f5f9' : '#0f172a',
                  color: conflictError ? '#94a3b8' : '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: conflictError || createSlot.isPending ? 'not-allowed' : 'pointer',
                  opacity: createSlot.isPending ? 0.7 : 1,
                  transition: 'background 150ms',
                  alignSelf: 'flex-end',
                }}
              >
                {createSlot.isPending ? 'Создание...' : 'Создать слот'}
              </button>
            </div>

            {/* Conflict warning */}
            {conflictError && (
              <div style={{
                marginTop: 8, padding: '6px 10px', borderRadius: 7,
                background: '#fef2f2', border: '1px solid #fecaca',
                fontSize: '0.75rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 5,
              }}>
                ⚠️ {conflictError}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty state when no day is selected */
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: 14,
          border: '1px dashed #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 40px',
          color: '#94a3b8',
          gap: 8,
        }}>
          <div style={{ fontSize: '2.5rem' }}>📅</div>
          <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem' }}>Выберите день</div>
          <div style={{ fontSize: '0.82rem', textAlign: 'center' }}>
            Нажмите на дату в календаре,<br />чтобы просмотреть и добавить слоты
          </div>
        </div>
      )}
    </div>
  );
}
