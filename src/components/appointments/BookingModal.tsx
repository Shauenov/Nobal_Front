'use client';

import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { X } from 'lucide-react';
import { useCreateSlot } from '@/hooks/useAppointments';

interface BookingModalProps {
  onClose: () => void;
}

/**
 * Quick slot-creation modal triggered from the Appointments dashboard.
 *
 * Note: BookRequest has no `student_id` (backend infers from auth token), so an
 * adviser cannot book on behalf of a student via the existing booking endpoint.
 * The most useful adviser action from the Appointments page is creating new
 * slots — this modal wraps `useCreateSlot` for that purpose. Students then
 * book the slots from the mobile app.
 */
export function BookingModal({ onClose }: BookingModalProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [error, setError] = useState<string | null>(null);

  const createSlot = useCreateSlot();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startTime || !endTime) {
      setError('Укажите время начала и окончания');
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setError('Время окончания должно быть позже начала');
      return;
    }

    try {
      await createSlot.mutateAsync({
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        duration_min: parseInt(duration, 10),
      });
      onClose();
    } catch {
      // toast is already shown by the hook
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

  const button = (variant: 'primary' | 'ghost'): CSSProperties => ({
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
              Добавить запись
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
              Создайте новый слот — студенты смогут забронировать его в приложении.
            </div>
          </div>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={body}>
            <div style={labelCol}>
              <span style={labelText}>Начало</span>
              <input
                type="datetime-local"
                style={input}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div style={labelCol}>
              <span style={labelText}>Окончание</span>
              <input
                type="datetime-local"
                style={input}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
            <div style={labelCol}>
              <span style={labelText}>Длительность (минут)</span>
              <input
                type="number"
                min={5}
                max={240}
                style={input}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            {error && (
              <div
                style={{
                  color: '#b91c1c',
                  fontSize: '0.8rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '8px 12px',
                  borderRadius: 8,
                }}
              >
                {error}
              </div>
            )}
          </div>
          <div style={footer}>
            <button type="button" style={button('ghost')} onClick={onClose}>
              Отмена
            </button>
            <button type="submit" style={button('primary')} disabled={createSlot.isPending}>
              {createSlot.isPending ? 'Создание…' : 'Создать слот'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
