'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { MessageOut } from '@/types/api';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';

interface MessageThreadProps {
  messages: MessageOut[];
  isLoading: boolean;
}

const threadContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
  padding: 'var(--space-4)',
  overflowY: 'auto',
  flex: 1,
  background: 'var(--color-surface)',
};

const messageWrapperStyle = (isMine: boolean): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: isMine ? 'flex-end' : 'flex-start',
  gap: '4px',
});

const messageBubbleStyle = (isMine: boolean): CSSProperties => ({
  maxWidth: '75%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-lg)',
  borderBottomRightRadius: isMine ? '4px' : 'var(--radius-lg)',
  borderBottomLeftRadius: isMine ? 'var(--radius-lg)' : '4px',
  background: isMine ? 'var(--color-primary)' : 'var(--color-surface-hover)',
  color: isMine ? '#fff' : 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
  lineHeight: 1.4,
  wordBreak: 'break-word',
});

export function MessageThread({ messages, isLoading }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUserId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return (
      <div style={{ ...threadContainer, alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
        Loading messages...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ ...threadContainer, alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
        No messages yet. Send a message to start the conversation.
      </div>
    );
  }

  // Sort messages ascending (oldest first) for chat UI, assuming API might return descending
  const sortedMessages = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div style={threadContainer}>
      {sortedMessages.map((msg) => {
        const isMine = currentUserId != null && msg.sender_id === currentUserId;
        return (
          <div key={msg.id} style={messageWrapperStyle(isMine)}>
            <div style={messageBubbleStyle(isMine)}>
              {msg.body}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', padding: '0 4px' }}>
              {format(new Date(msg.created_at), 'HH:mm')}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
