'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (text: string) => void;
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

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
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
      <textarea
        style={textareaStyle}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Enter to send)"
        disabled={disabled}
        rows={text.split('\n').length > 1 ? Math.min(text.split('\n').length, 5) : 1}
      />
      <button 
        style={{ ...buttonStyle, opacity: disabled || !text.trim() ? 0.5 : 1 }}
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </div>
  );
}
