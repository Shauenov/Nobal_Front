'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useCreateCalendarEvent } from '@/hooks/useCalendar';
import type { CalendarEventCreate } from '@/types/api';

const formStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 320 };
const inputStyle: CSSProperties = { padding: 8, borderRadius: 6, border: '1px solid var(--color-border)' };

interface Props {
  initial?: Partial<CalendarEventCreate>;
  onDone?: () => void;
}

export function EventForm({ initial, onDone }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [start, setStart] = useState(initial?.start_time ?? '');
  const [end, setEnd] = useState(initial?.end_time ?? '');
  const create = useCreateCalendarEvent();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const payload: CalendarEventCreate = {
      title,
      description: description || undefined,
      event_type: 'custom',
      start_time: start,
      end_time: end || undefined,
      all_day: false,
      color: '#0ea5a4',
    };
    await create.mutateAsync(payload);
    onDone?.();
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />

      <label>Description</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: 100 }} />

      <label>Start</label>
      <input value={start} onChange={(e) => setStart(e.target.value)} type="datetime-local" style={inputStyle} />

      <label>End</label>
      <input value={end} onChange={(e) => setEnd(e.target.value)} type="datetime-local" style={inputStyle} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="submit" style={{ padding: '8px 12px' }} disabled={create.isPending}>
          {create.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
