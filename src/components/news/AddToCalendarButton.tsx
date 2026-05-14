'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useAddNewsToCalendar } from '@/hooks/useNews';

interface Props {
  newsId: string;
  onClose?: () => void;
}

const popoverStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 40,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  padding: '12px',
  borderRadius: '8px',
  minWidth: 220,
};

export function AddToCalendarButton({ newsId, onClose }: Props) {
  const [open, setOpen] = useState(true);
  const [days, setDays] = useState<number | ''>(0);
  const add = useAddNewsToCalendar(newsId);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await add.mutateAsync({ reminder_days_before: days === '' ? null : Number(days) });
    setOpen(false);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div style={popoverStyle} role="dialog">
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 6 }}>Remind days before</label>
        <input
          type="number"
          min={0}
          max={30}
          value={days}
          onChange={(e) => setDays(e.target.value === '' ? '' : Number(e.target.value))}
          style={{ width: '100%', padding: '8px', marginBottom: 8 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={() => { setOpen(false); onClose?.(); }} style={{ padding: '6px 8px' }}>
            Cancel
          </button>
          <button type="submit" disabled={add.isPending} style={{ padding: '6px 8px' }}>
            {add.isPending ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
