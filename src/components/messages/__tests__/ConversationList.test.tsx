import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConversationList } from '../ConversationList';
import type { ConversationOut } from '@/types/api';

describe('ConversationList', () => {
  it('renders student full name from map and handles select', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    const conversations: ConversationOut[] = [
      {
        id: 'convo-1',
        student_id: 'student-1',
        adviser_id: 'adviser-1',
        last_message_at: null,
        created_at: '2026-05-09T00:00:00.000Z',
      },
    ];

    render(
      <ConversationList
        conversations={conversations}
        onSelect={onSelect}
        studentNameMap={{ 'student-1': 'Alice Doe' }}
      />,
    );

    await user.click(screen.getByText('Alice Doe'));

    expect(onSelect).toHaveBeenCalledWith('convo-1');
  });
});
