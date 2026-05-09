import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ConversationOut } from '@/types/api';
import { MessagesDashboard } from '../MessagesDashboard';

const markRead = vi.fn();
const sendMessage = vi.fn();

const conversations = [
  {
    id: 'convo-1',
    student_id: 'student-1',
    conductor_id: 'conductor-1',
    last_message_at: '2026-05-09T00:00:00.000Z',
    created_at: '2026-05-09T00:00:00.000Z',
    unread_count: 3,
  },
];

vi.mock('@/hooks/useMessages', () => ({
  useConversations: () => ({ data: conversations, isLoading: false }),
  useMessages: () => ({ data: { data: [] }, isLoading: false }),
  useSendMessage: () => ({ mutate: sendMessage, isPending: false }),
  useMarkRead: () => ({ mutate: markRead }),
}));

vi.mock('@/components/layout/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock('../ConversationList', () => ({
  ConversationList: ({ conversations, onSelect }: { conversations: ConversationOut[]; onSelect: (id: string) => void }) => (
    <button type="button" onClick={() => onSelect(conversations[0].id)}>
      Open conversation
    </button>
  ),
}));

vi.mock('../MessageThread', () => ({
  MessageThread: () => <div>Message thread</div>,
}));

vi.mock('../MessageInput', () => ({
  MessageInput: () => <div>Message input</div>,
}));

vi.mock('../BroadcastModal', () => ({
  BroadcastModal: () => null,
}));

describe('MessagesDashboard', () => {
  it('marks the conversation as read after selection', async () => {
    const user = userEvent.setup();

    render(<MessagesDashboard />);

    await user.click(screen.getByRole('button', { name: 'Open conversation' }));

    await waitFor(() => {
      expect(markRead).toHaveBeenCalledTimes(1);
    });
  });
});