'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useSlots, useCreateSlot, useDeleteSlot } from '@/hooks/useAppointments';

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
};

const slotItemStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const inputStyle: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
};

const buttonStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  fontWeight: 'var(--font-medium)',
  cursor: 'pointer',
  fontSize: 'var(--text-sm)',
};

export function SlotManager() {
  const slots = useSlots();
  const createSlot = useCreateSlot();
  const deleteSlot = useDeleteSlot();

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('30');

  const handleCreate = () => {
    if (!startTime || !endTime) return;
    createSlot.mutate({
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      duration_min: parseInt(duration, 10),
    });
  };

  const activeSlots = slots.data ?? [];

  return (
    <div style={containerStyle}>
      <div style={{ background: 'var(--color-surface-hover)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-3)' }}>
          Create New Slot
        </h3>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Start Time</label>
            <input type="datetime-local" style={inputStyle} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>End Time</label>
            <input type="datetime-local" style={inputStyle} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Duration (min)</label>
            <input type="number" style={{ ...inputStyle, width: '80px' }} value={duration} onChange={(e) => setDuration(e.target.value)} min="5" max="240" />
          </div>
          <button style={buttonStyle} onClick={handleCreate} disabled={createSlot.isPending}>
            {createSlot.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-semibold)', marginTop: 'var(--space-2)' }}>
          Available Slots
        </h3>
        {slots.isLoading ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>Loading slots...</div>
        ) : activeSlots.length === 0 ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>No slots available.</div>
        ) : (
          activeSlots.map((slot) => (
            <div key={slot.id} style={slotItemStyle}>
              <div>
                <div style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>
                  {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleTimeString()}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  Duration: {slot.duration_min} min · {slot.is_available ? 'Available' : 'Booked'}
                </div>
              </div>
              <button
                style={{
                  ...buttonStyle,
                  background: 'transparent',
                  border: '1px solid var(--color-error)',
                  color: 'var(--color-error)',
                  padding: '4px 8px',
                }}
                onClick={() => deleteSlot.mutate(slot.id)}
                disabled={deleteSlot.isPending}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
