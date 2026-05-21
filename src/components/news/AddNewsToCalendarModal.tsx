"use client";

import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Calendar, X } from 'lucide-react';
import { useCreateCalendarEvent } from '@/hooks/useCalendar';
import type { NewsOut } from '@/types/api';

function toLocalDateTime(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  const tzOffset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
}

const labelStyle: CSSProperties = {
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#475569',
  marginBottom: 4,
  display: 'block',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: '0.875rem',
  color: '#1e293b',
  outline: 'none',
  boxSizing: 'border-box',
};

interface Props {
  news: NewsOut;
  onClose: () => void;
}

export function AddNewsToCalendarModal({ news, onClose }: Props) {
  const [closing, setClosing] = useState(false);
  const [title, setTitle] = useState(news.title);
  const [description, setDescription] = useState(news.body ?? '');
  const [startTime, setStartTime] = useState(
    toLocalDateTime(news.event_date ?? news.created_at)
  );

  const create = useCreateCalendarEvent();

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 180);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  const handleSave = async () => {
    if (!title.trim() || !startTime) return;
    await create.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      event_type: 'custom',
      start_time: startTime,
      end_time: undefined,
      all_day: false,
      color: '#0ea5e9',
    });
    handleClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          width: 'min(480px, calc(100% - 32px))',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          opacity: closing ? 0 : 1,
          transform: closing ? 'translateY(6px) scale(0.98)' : 'translateY(0) scale(1)',
          transition: 'opacity 180ms ease, transform 180ms ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Calendar size={18} color="#2563eb" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              Сохранить в календарь
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 1 }}>
              Событие появится на странице «Календарь»
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#94a3b8', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Название события</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              placeholder="Введите название"
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Описание <span style={{ fontWeight: 400, color: '#94a3b8' }}>(необязательно)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', minHeight: 72 }}
              placeholder="Краткое описание события..."
            />
          </div>

          {/* Start time */}
          <div>
            <label style={labelStyle}>Дата и время начала</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Source hint */}
          <div style={{
            padding: '10px 12px',
            background: '#f8fafc',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: '0.78rem',
            color: '#64748b',
          }}>
            📰 Новость: <strong style={{ color: '#334155' }}>{news.title}</strong>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '0 24px 20px',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: '9px 18px', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#fff',
              color: '#475569', fontSize: '0.875rem', fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={create.isPending || !title.trim() || !startTime}
            style={{
              padding: '9px 20px', borderRadius: 8,
              border: 'none', background: '#2563eb',
              color: '#fff', fontSize: '0.875rem', fontWeight: 600,
              cursor: create.isPending ? 'not-allowed' : 'pointer',
              opacity: create.isPending ? 0.7 : 1,
            }}
          >
            {create.isPending ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
