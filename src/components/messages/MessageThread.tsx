'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { MessageOut } from '@/types/api';
import { useAuthStore } from '@/stores/authStore';
import { format, formatDistanceToNow, formatRelative, isYesterday, differenceInCalendarDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { normalizeImageUrl } from '@/lib/imageUrl';

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
        Загрузка сообщений...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ ...threadContainer, alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
        Сообщений пока нет. Напишите первое сообщение.
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
              {msg.image_url ? (
                (() => {
                  const src = normalizeImageUrl(msg.image_url) || msg.image_url;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <a href={src} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={msg.sender_name ?? 'image'} style={{ maxWidth: '320px', width: '100%', height: 'auto', borderRadius: 8 }} />
                      </a>
                      {msg.body && msg.body.trim() !== '[Image]' && (
                        <div>{msg.body}</div>
                      )}
                    </div>
                  );
                })()
              ) : (
                msg.body
              )}
            </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', padding: '0 4px' }}>
                {(() => {
                  const dateObj = new Date(msg.created_at);
                  const now = new Date();
                  // Today -> relative like "2 часа назад"
                  if (differenceInCalendarDays(now, dateObj) === 0) {
                    return (
                      <time title={dateObj.toLocaleString()}>
                        {formatDistanceToNow(dateObj, { addSuffix: true, locale: ru })}
                      </time>
                    );
                  }

                  // Yesterday -> show localized "вчера в HH:mm" (formatRelative handles locale)
                  if (isYesterday(dateObj)) {
                    return (
                      <time title={dateObj.toLocaleString()}>
                        {formatRelative(dateObj, now, { locale: ru })}
                      </time>
                    );
                  }

                  // Older -> exact date
                  return (
                    <time title={dateObj.toLocaleString()}>
                      {format(dateObj, 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </time>
                  );
                })()}
              </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
