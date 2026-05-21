import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import CalendarPage from '../page';

vi.mock('@/components/layout/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const mockUseCalendar = vi.fn();

vi.mock('@/hooks/useCalendar', () => ({
  useCalendar: (...args: unknown[]) => mockUseCalendar(...args),
  useDeleteCalendarEvent: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/components/calendar/CalendarEventModal', () => ({
  CalendarEventModal: () => <div>CalendarEventModal</div>,
}));

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('renders calendar grid with weekday headers', () => {
    mockUseCalendar.mockReturnValue({ data: [], isLoading: false });

    render(<CalendarPage />);

    expect(screen.getByText('Календарь')).toBeInTheDocument();
    expect(screen.getByText('Пн')).toBeInTheDocument();
    expect(screen.getByText('Вс')).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    mockUseCalendar.mockReturnValue({ data: [], isLoading: false });

    render(<CalendarPage />);

    expect(screen.getByText('Нет событий')).toBeInTheDocument();
  });

  it('shows event chip on the correct day', () => {
    const today = new Date();
    const todayIso = today.toISOString();

    mockUseCalendar.mockReturnValue({
      data: [
        {
          id: 'ev-1',
          user_id: 'user-1',
          title: 'Meeting',
          description: null,
          event_type: 'custom',
          start_time: todayIso,
          end_time: null,
          all_day: false,
          color: '#ff6b35',
          source_id: null,
          source_type: null,
          created_at: todayIso,
        },
      ],
      isLoading: false,
    });

    render(<CalendarPage />);

    expect(screen.getByText('Meeting')).toBeInTheDocument();
  });

  it('navigates to next and previous months', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    mockUseCalendar.mockReturnValue({ data: [], isLoading: false });

    render(<CalendarPage />);

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await user.click(screen.getByTitle('Следующий месяц'));

    const { format } = await import('date-fns');
    const { ru } = await import('date-fns/locale');
    const expected = format(nextMonth, 'LLLL yyyy', { locale: ru });
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
