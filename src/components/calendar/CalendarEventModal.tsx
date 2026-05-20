'use client';

import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { X } from 'lucide-react';
import { useCreateCalendarEvent } from '@/hooks/useCalendar';

interface CalendarEventModalProps {
  onClose: () => void;
  /** Pre-fill date if opened by clicking a day cell */
  defaultDate?: string;
}

export function CalendarEventModal({ onClose, defaultDate }: CalendarEventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate ?? '');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = useCreateCalendarEvent();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError('Введите название события'); return; }
    if (!date) { setError('Укажите дату'); return; }

    const startIso = allDay
      ? new Date(date).toISOString()
      : new Date(`${date}T${time || '00:00'}`).toISOString();

    const endIso =
      !allDay && endTime
        ? new Date(`${date}T${endTime}`).toISOString()
        : null;

    try {
      await createEvent.mutateAsync({
        title: title.trim(),
        description: notes.trim() || null,
        event_type: 'custom',
        start_time: startIso,
        end_time: endIso,
        all_day: allDay,
      });
      onClose();
    } catch {
      // hook already toasts on error
    }
  };

  /* ─── Styles ─── */
  const overlay: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.45)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  };

  const card: CSSProperties = {
    background: '#fff',
    borderRadius: 14,
    width: '100%',
    maxWidth: 460,
    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.2)',
    overflow: 'hidden',
  };

  const header: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 22px',
    borderBottom: '1px solid #e8ecf0',
  };

  const body: CSSProperties = {
    padding: '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  };

  const labelCol: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  };

  const labelText: CSSProperties = {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#475569',
  };

  const input: CSSProperties = {
    padding: '9px 12px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    fontSize: '0.875rem',
    color: '#1e293b',
    background: '#fff',
  };

  const footer: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '14px 22px 20px',
    borderTop: '1px solid #f1f5f9',
  };

  const btn = (variant: 'primary' | 'ghost'): CSSProperties => ({
    padding: '9px 18px',
    borderRadius: 8,
    border: variant === 'ghost' ? '1px solid #e2e8f0' : 'none',
    background: variant === 'primary' ? '#2563eb' : '#fff',
    color: variant === 'primary' ? '#fff' : '#475569',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  });

  return (
    <div style={overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b' }}>
              Добавить событие
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
              Создайте новое событие в календаре
            </div>
          </div>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={body}>
            <div style={labelCol}>
              <span style={labelText}>Название</span>
              <input
                type="text"
                style={input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название события"
                required
              />
            </div>

            <div style={labelCol}>
              <span style={labelText}>Дата</span>
              <input
                type="date"
                style={input}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}>
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
              Весь день
            </label>

            {!allDay && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={labelCol}>
                  <span style={labelText}>Начало</span>
                  <input type="time" style={input} value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
                <div style={labelCol}>
                  <span style={labelText}>Окончание</span>
                  <input type="time" style={input} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
            )}

            <div style={labelCol}>
              <span style={labelText}>Заметки</span>
              <textarea
                rows={3}
                style={{ ...input, resize: 'vertical', fontFamily: 'inherit' }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Необязательное описание"
              />
            </div>

            {error && (
              <div style={{ color: '#b91c1c', fontSize: '0.8rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: 8 }}>
                {error}
              </div>
            )}
          </div>

          <div style={footer}>
            <button type="button" style={btn('ghost')} onClick={onClose}>Отмена</button>
            <button type="submit" style={btn('primary')} disabled={createEvent.isPending}>
              {createEvent.isPending ? 'Создание…' : 'Создать событие'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
