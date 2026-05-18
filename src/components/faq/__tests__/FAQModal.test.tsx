import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FAQModal } from '../FAQModal';

const createFAQ = vi.fn();
const updateFAQ = vi.fn();

vi.mock('@/hooks/useFAQ', () => ({
  useCreateFAQ: () => ({ mutateAsync: createFAQ, isPending: false }),
  useUpdateFAQ: () => ({ mutateAsync: updateFAQ, isPending: false }),
}));

describe('FAQModal', () => {
  beforeEach(() => {
    createFAQ.mockReset();
    updateFAQ.mockReset();
  });

  it('creates a new FAQ with validation and default order', async () => {
    vi.useRealTimers();
    const onClose = vi.fn();
    createFAQ.mockResolvedValue({});
    const user = userEvent.setup();

    render(<FAQModal open onClose={onClose} defaultOrderIndex={4} />);

    await user.type(screen.getByLabelText('Question'), 'How do I reset my password?');
    await user.type(
      screen.getByLabelText('Answer'),
      'Use the forgot password flow to receive a reset link.',
    );
    await user.type(screen.getByLabelText('Category'), 'Auth');
    await user.click(screen.getByRole('button', { name: 'Create FAQ' }));

    await waitFor(() => {
      expect(createFAQ).toHaveBeenCalledWith({
        question: 'How do I reset my password?',
        answer: 'Use the forgot password flow to receive a reset link.',
        category: 'Auth',
        is_active: true,
        order_index: 4,
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    }, { timeout: 10000 });
  });

  it('updates an existing FAQ', async () => {
    vi.useRealTimers();
    const onClose = vi.fn();
    updateFAQ.mockResolvedValue({});
    const user = userEvent.setup();

    render(
      <FAQModal
        open
        onClose={onClose}
        initialValues={{
          id: 'faq-1',
          question: 'Old question',
          answer: 'Old answer',
          category: 'General',
          order_index: 2,
          is_active: true,
          created_by: 'user-1',
          created_at: '2026-05-08T00:00:00.000Z',
          updated_at: '2026-05-08T00:00:00.000Z',
        }}
      />,
    );

    await user.clear(screen.getByLabelText('Question'));
    await user.type(screen.getByLabelText('Question'), 'New question');
    await user.clear(screen.getByLabelText('Answer'));
    await user.type(screen.getByLabelText('Answer'), 'A longer updated answer for the FAQ entry.');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(updateFAQ).toHaveBeenCalledWith({
        id: 'faq-1',
        data: {
          question: 'New question',
          answer: 'A longer updated answer for the FAQ entry.',
          category: 'General',
          is_active: true,
        },
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    }, { timeout: 10000 });
  });
});