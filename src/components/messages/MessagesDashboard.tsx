'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { CSSProperties } from 'react';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useSendImageMessage,
  useMarkRead,
  useGetOrCreateConversation,
} from '@/hooks/useMessages';
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

interface MessagesDashboardProps {
  initialConvoId?: string;
  initialStudentId?: string;
}

export function MessagesDashboard({ initialConvoId, initialStudentId }: MessagesDashboardProps) {
  const [activeConvoId, setActiveConvoId] = useState<string | undefined>(initialConvoId);
  const [syncedConvoId, setSyncedConvoId] = useState(initialConvoId);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  // Sync initialConvoId into activeConvoId when it changes (render-phase derived state)
  if (syncedConvoId !== initialConvoId) {
    setSyncedConvoId(initialConvoId);
    if (initialConvoId) setActiveConvoId(initialConvoId);
  }

  const { data: convosResponse, isLoading: isLoadingConvos } = useConversations();
  const { data: studentsResponse } = useStudents({ page: 1, page_size: 100 });
  const conversations = useMemo(() => convosResponse ?? [], [convosResponse]);
  const students = useMemo(() => studentsResponse?.data ?? [], [studentsResponse]);

  // Auto-select conversation by student ID (render-phase derived state)
  // Uses a sentinel initialised to undefined so the check fires even when data is cached
  const studentConvoId = useMemo(() => {
    if (!initialStudentId || !conversations.length) return undefined;
    return conversations.find((c) => c.student_id === initialStudentId)?.id;
  }, [initialStudentId, conversations]);
  const [appliedStudentConvoId, setAppliedStudentConvoId] = useState<string | undefined>(undefined);
  if (studentConvoId && appliedStudentConvoId !== studentConvoId) {
    setAppliedStudentConvoId(studentConvoId);
    setActiveConvoId(studentConvoId);
  }

  // Auto-create conversation when arriving via ?student= URL and no conversation exists yet.
  // Uses a ref to ensure we only fire once per initialStudentId value.
  const autoCreateTriggeredFor = useRef<string | null>(null);
  const getOrCreateConvo = useGetOrCreateConversation();
  const { mutate: createConvo } = getOrCreateConvo;
  useEffect(() => {
    if (!initialStudentId || isLoadingConvos) return;
    if (conversations.find((c) => c.student_id === initialStudentId)) return; // already exists
    if (autoCreateTriggeredFor.current === initialStudentId) return;          // already triggered
    autoCreateTriggeredFor.current = initialStudentId;
    createConvo(initialStudentId);                                             // no setState here
  }, [initialStudentId, conversations, isLoadingConvos, createConvo]);

  const studentNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const student of students) {
      map[student.id] = student.full_name;
    }
    return map;
  }, [students]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConvoId),
    [conversations, activeConvoId],
  );

  const { data: messagesResponse, isLoading: isLoadingMessages } = useMessages(activeConvoId ?? '', { limit: 100 });
  const messages = messagesResponse?.data ?? [];

  const sendMessage = useSendMessage(activeConvoId ?? '');
  const sendImage = useSendImageMessage(activeConvoId ?? '');
  const markRead = useMarkRead(activeConvoId ?? '');

  useEffect(() => {
    const unread = activeConversation
      ? ('unread_count' in activeConversation && typeof activeConversation.unread_count === 'number'
        ? activeConversation.unread_count
        : 'unread_messages' in activeConversation && typeof activeConversation.unread_messages === 'number'
          ? activeConversation.unread_messages
          : 0)
      : 0;
    if (activeConversation && unread > 0) {
      markRead.mutate();
    }
  }, [activeConversation, markRead]);

  // When clicking a student who doesn't have a conversation yet — create one first
  const handleSelectStudent = useCallback(async (studentId: string) => {
    try {
      const convo = await getOrCreateConvo.mutateAsync(studentId);
      setActiveConvoId(convo.id);
    } catch {
      // error toast is handled by the mutation's onError
    }
  }, [getOrCreateConvo]);

  const handleSend = (text: string) => {
    if (!activeConvoId) return;
    sendMessage.mutate({ body: text });
  };

  const handleSendImage = (file: File, body?: string | null) => {
    if (!activeConvoId) return;
    sendImage.mutate({ image: file, body });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageHeader
          title="Сообщения"
          subtitle="Чат с вашими студентами."
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
          Рассылка
        </button>
      </div>

      <div style={layoutStyle}>
        <div style={sidebarStyle}>
          {isLoadingConvos ? (
            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>Загрузка...</div>
          ) : (
            <ConversationList
              conversations={conversations}
              students={students}
              activeConvoId={activeConvoId}
              onSelect={setActiveConvoId}
              onSelectStudent={handleSelectStudent}
              isCreating={getOrCreateConvo.isPending}
              studentNameMap={studentNameMap}
            />
          )}
        </div>
        <div style={mainAreaStyle}>
          {getOrCreateConvo.isPending ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
              Открываем диалог…
            </div>
          ) : activeConvoId ? (
            <>
              <MessageThread messages={messages} isLoading={isLoadingMessages} />
              <MessageInput onSend={handleSend} onSendImage={handleSendImage} disabled={sendMessage.isPending || sendImage.isPending} />
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
              Выберите студента для начала переписки
            </div>
          )}
        </div>
      </div>

      <BroadcastModal isOpen={isBroadcastOpen} onClose={() => setIsBroadcastOpen(false)} />
    </div>
  );
}
