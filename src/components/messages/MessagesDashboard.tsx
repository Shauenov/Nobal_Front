'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useConversations, useMessages, useSendMessage, useMarkRead } from '@/hooks/useMessages';
import { useStudents } from '@/hooks/useStudents';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import { MessageInput } from './MessageInput';
import { BroadcastModal } from './BroadcastModal';
import { PageHeader } from '@/components/layout/PageHeader';

const layoutStyle: CSSProperties = {
  display: 'flex',
  height: 'calc(100vh - 180px)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
};

const sidebarStyle: CSSProperties = {
  width: '320px',
  borderRight: '1px solid var(--color-border)',
  display: 'flex',
  flexDirection: 'column',
};

const mainAreaStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
};

export function MessagesDashboard() {
  const [activeConvoId, setActiveConvoId] = useState<string | undefined>();
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  const { data: convosResponse, isLoading: isLoadingConvos } = useConversations();
  const { data: studentsResponse } = useStudents({ page: 1, page_size: 100 });
  const conversations = useMemo(() => convosResponse ?? [], [convosResponse]);
  const studentNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const student of studentsResponse?.data ?? []) {
      map[student.id] = student.full_name;
    }
    return map;
  }, [studentsResponse]);
  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConvoId),
    [conversations, activeConvoId],
  );

  const { data: messagesResponse, isLoading: isLoadingMessages } = useMessages(activeConvoId ?? '', { page_size: 100 });
  const messages = messagesResponse?.data ?? [];

  const sendMessage = useSendMessage(activeConvoId ?? '');
  const markRead = useMarkRead(activeConvoId ?? '');

  useEffect(() => {
    const unread = (activeConversation as any)?.unread_count ?? (activeConversation as any)?.unread_messages ?? 0;
    if (activeConversation && unread > 0) {
      markRead.mutate();
    }
  }, [activeConversation, markRead]);

  const handleSend = (text: string) => {
    if (!activeConvoId) return;
    sendMessage.mutate({ body: text });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageHeader 
          title="Messages" 
          subtitle="Chat with your students." 
        />
        <button
          style={{
            padding: '8px 16px',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 'var(--font-medium)'
          }}
          onClick={() => setIsBroadcastOpen(true)}
        >
          Send Broadcast
        </button>
      </div>

      <div style={layoutStyle}>
        <div style={sidebarStyle}>
          {isLoadingConvos ? (
            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>Loading conversations...</div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeConvoId={activeConvoId}
              onSelect={setActiveConvoId}
              studentNameMap={studentNameMap}
            />
          )}
        </div>
        <div style={mainAreaStyle}>
          {activeConvoId ? (
            <>
              <MessageThread messages={messages} isLoading={isLoadingMessages} />
              <MessageInput onSend={handleSend} disabled={sendMessage.isPending} />
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>

      <BroadcastModal isOpen={isBroadcastOpen} onClose={() => setIsBroadcastOpen(false)} />
    </div>
  );
}
