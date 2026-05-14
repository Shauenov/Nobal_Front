import type { CSSProperties } from 'react';
import { ConversationOut } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: ConversationOut[];
  activeConvoId?: string;
  onSelect: (id: string) => void;
  studentNameMap?: Record<string, string>;
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

export function ConversationList({
  conversations,
  activeConvoId,
  onSelect,
  studentNameMap = {},
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
        No conversations yet.
      </div>
    );
  }

  return (
    <div style={listContainer}>
      {conversations.map((convo) => {
        const isActive = convo.id === activeConvoId;
        const hasUnread = ((convo as any).unread_count ?? (convo as any).unread_messages ?? 0) > 0;

        return (
          <div
            key={convo.id}
            style={itemStyle(isActive)}
            onClick={() => onSelect(convo.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: hasUnread ? 'var(--font-bold)' : 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>
                {studentNameMap[convo.student_id] ?? convo.student_id}
              </div>
              {convo.last_message_at && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true })}
                </div>
              )}
            </div>
            {hasUnread && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>
                  {(convo as any).unread_count ?? (convo as any).unread_messages ?? 0} new messages
                </div>
              </div>
            )}
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              {/* STUB: last message preview not returned by API */}
              Tap to view conversation
            </div>
          </div>
        );
      })}
    </div>
  );
}
