"use client";

import { useCallback, useEffect, useState } from 'react';
import { EventForm } from '@/components/calendar/EventForm';
import type { NewsOut } from '@/types/api';
import type { CSSProperties } from 'react';

function toLocalDateTime(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  const tzOffset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tzOffset);
  // yyyy-mm-ddThh:mm
  return local.toISOString().slice(0, 16);
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
};

const panelBase: CSSProperties = {
  background: 'var(--color-surface)',
  padding: 12,
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  width: 'min(720px, calc(100% - 48px))',
  boxShadow: '0 8px 24px rgba(2,6,23,0.2)',
  transition: 'transform 180ms ease, opacity 180ms ease',
};

interface Props {
  news: NewsOut;
  onClose: () => void;
}

export function AddNewsToCalendarModal({ news, onClose }: Props) {
  const [open, setOpen] = useState(true);
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      onClose();
    }, 180);
  }, [onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  if (!open) return null;

  const initial = {
    title: news.title,
    description: news.body,
    start_time: toLocalDateTime(news.event_date ?? news.created_at),
    end_time: undefined,
  };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" onClick={handleClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...panelBase,
          opacity: closing ? 0 : 1,
          transform: closing ? 'translateY(8px) scale(0.995)' : 'translateY(0) scale(1)'.toString(),
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Добавить в календарь</h3>
          <button
            aria-label="Закрыть"
            onClick={handleClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 }}
          >
            ✕
          </button>
        </div>

        <EventForm initial={initial} onDone={handleClose} />
      </div>
    </div>
  );
}
