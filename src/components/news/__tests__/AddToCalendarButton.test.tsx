import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AddToCalendarButton } from '../AddToCalendarButton';

const mutate = vi.fn();

vi.mock('@/hooks/useNews', () => ({
  useAddNewsToCalendar: () => ({ mutateAsync: mutate, isLoading: false }),
}));

describe('AddToCalendarButton', () => {
  beforeEach(() => {
    mutate.mockReset();
  });

  it('submits reminder_days_before and closes on success', async () => {
    mutate.mockResolvedValue({});
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<AddToCalendarButton newsId="news-1" onClose={onClose} />);

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '3');

    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({ reminder_days_before: 3 });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
