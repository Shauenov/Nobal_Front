'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (text: string) => void;
  onSendImage?: (file: File, body?: string | null) => void;
  disabled?: boolean;
}

const containerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: 'var(--space-2)',
  padding: 'var(--space-3)',
  borderTop: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
};

const textareaStyle: CSSProperties = {
  flex: 1,
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
  resize: 'none',
  minHeight: '40px',
  maxHeight: '120px',
  fontFamily: 'inherit',
};

const buttonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  height: '40px',
  width: '40px',
};

export function MessageInput({ onSend, onSendImage, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canSend = !disabled && (!!file || text.trim().length > 0);

  // Revoke stale object URLs when previewUrl changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSend = () => {
    if (disabled) return;

    if (file && typeof onSendImage === 'function') {
      onSendImage(file, text.trim() || undefined);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(null);
      setPreviewUrl(null);
      setText('');
      return;
    }

    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={containerStyle}>
      <input
        type="file"
        accept="image/*"
        id="message-image-input"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (f) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setFile(f);
            setPreviewUrl(URL.createObjectURL(f));
          }
          // Allow selecting the same file again later
          e.currentTarget.value = '';
        }}
      />
      <textarea
        style={textareaStyle}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Enter to send)"
        disabled={disabled}
        rows={text.split('\n').length > 1 ? Math.min(text.split('\n').length, 5) : 1}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
        <label htmlFor="message-image-input" style={{ cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
          Attach
        </label>
        {previewUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="preview" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }} />
          </>
        )}
      </div>
      <button 
        style={{ ...buttonStyle, opacity: canSend ? 1 : 0.5 }}
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </div>
  );
}
