'use client';

import type { CSSProperties } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { ConversationOut, StudentListItem } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: ConversationOut[];
  students?: StudentListItem[];
  activeConvoId?: string;
  onSelect: (convoId: string) => void;
  onSelectStudent?: (studentId: string) => void;
  isCreating?: boolean;
  studentNameMap?: Record<string, string>;
}

function getUnreadCount(conversation: ConversationOut) {
  if ('unread_count' in conversation && typeof conversation.unread_count === 'number') {
    return conversation.unread_count;
  }

  if ('unread_messages' in conversation && typeof conversation.unread_messages === 'number') {
    return conversation.unread_messages;
  }

  return 0;
}

const listContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
  background: 'var(--color-border)',
  height: '100%',
  overflowY: 'auto',
};

const itemStyle = (isActive: boolean): CSSProperties => ({
  background: isActive ? 'var(--color-surface-hover)' : 'var(--color-surface)',
  padding: 'var(--space-3)',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
});

const stubItemStyle: CSSProperties = {
  background: 'var(--color-surface)',
  padding: 'var(--space-3)',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  borderLeft: '3px solid transparent',
  opacity: 0.7,
};

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function ConversationList({
  conversations,
  students = [],
  activeConvoId,
  onSelect,
  onSelectStudent,
  isCreating = false,
  studentNameMap = {},
}: ConversationListProps) {
  // Sort conversations: most recently active first
  const sortedConversations = [...conversations].sort((a, b) => {
    const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
    const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
    return tb - ta;
  });

  // Build a set of student IDs that already have conversations
  const convoByStudentId = new Map(conversations.map((c) => [c.student_id, c]));

  // Students without a conversation (show below existing conversations)
  const studentsWithoutConvo = students.filter((s) => !convoByStudentId.has(s.id));

  const totalCount = conversations.length + studentsWithoutConvo.length;

  if (totalCount === 0) {
    return (
      <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
        Нет студентов
      </div>
    );
  }

  return (
    <div style={listContainer}>
      {/* ── Existing conversations (sorted by latest message) ── */}
      {sortedConversations.map((convo) => {
        const isActive = convo.id === activeConvoId;
        const unreadCount = getUnreadCount(convo);
        const hasUnread = unreadCount > 0;
        const name = studentNameMap[convo.student_id] ?? convo.student_id;

        return (
          <div
            key={convo.id}
            style={itemStyle(isActive)}
            onClick={() => onSelect(convo.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {getInitials(name)}
                </div>
                <span style={{
                  fontWeight: hasUnread ? 'var(--font-bold)' : 'var(--font-medium)',
                  fontSize: 'var(--text-sm)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {name}
                </span>
              </div>
              {convo.last_message_at && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                  {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true })}
                </div>
              )}
            </div>

            {hasUnread ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: 40 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>
                  {unreadCount} новых
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', paddingLeft: 40 }}>
                Нажмите, чтобы открыть
              </div>
            )}
          </div>
        );
      })}

      {/* ── Divider ── */}
      {studentsWithoutConvo.length > 0 && conversations.length > 0 && (
        <div style={{
          padding: '6px 12px',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          background: 'var(--color-surface)',
          borderLeft: '3px solid transparent',
        }}>
          Без переписки
        </div>
      )}

      {/* ── Students without conversations ── */}
      {studentsWithoutConvo.map((student) => {
        const name = student.full_name;
        return (
          <div
            key={`student-${student.id}`}
            style={stubItemStyle}
            onClick={() => !isCreating && onSelectStudent?.(student.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#94a3b8',
                color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {getInitials(name)}
              </div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 40, fontSize: 'var(--text-xs)', color: '#64748b' }}>
              <MessageSquarePlus size={11} />
              Начать диалог
            </div>
          </div>
        );
      })}
    </div>
  );
}
