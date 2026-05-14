import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddNewsToCalendarModal } from '../AddNewsToCalendarModal';
import type { NewsOut } from '@/types/api';

const createEvent = vi.fn();

vi.mock('@/hooks/useCalendar', () => ({
  useCreateCalendarEvent: () => ({ mutateAsync: createEvent, isLoading: false }),
}));

function makeNews(overrides: Partial<NewsOut> = {}): NewsOut {
  return {
    id: 'news-1',
    author_id: 'author-1',
    title: 'Campus Open Day',
    body: 'Visit the campus and meet mentors.',
    cover_url: null,
    category: 'general',
    event_date: '2026-05-20T09:30:00.000Z',
    external_url: null,
    is_published: true,
    views_count: 0,
    created_at: '2026-05-10T08:00:00.000Z',
    updated_at: '2026-05-10T08:00:00.000Z',
    ...overrides,
  };
}

describe('AddNewsToCalendarModal', () => {
  beforeEach(() => {
    createEvent.mockReset();
  });

  it('prefills EventForm from selected news item and submits', async () => {
    createEvent.mockResolvedValue({});
    const onClose = vi.fn();
    const user = userEvent.setup();
    const news = makeNews();

    const { container } = render(<AddNewsToCalendarModal news={news} onClose={onClose} />);

    expect(screen.getByDisplayValue('Campus Open Day')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Visit the campus and meet mentors.')).toBeInTheDocument();

    const start = container.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    expect(start).toBeTruthy();
    expect(start.value).toMatch(/^2026-05-20T\d{2}:30$/);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(createEvent).toHaveBeenCalledTimes(1);
      expect(createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Campus Open Day',
          description: 'Visit the campus and meet mentors.',
          event_type: 'custom',
          all_day: false,
          color: '#0ea5a4',
        }),
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
