import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import NewsPage from '../page';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock('@/components/layout/PageHeader', () => ({
  PageHeader: ({ title, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
    <div><h1>{title}</h1>{action}</div>
  ),
}));

vi.mock('@/components/news/NewsForm', () => ({
  NewsForm: ({ onSubmit }: { onSubmit: (data: unknown) => void }) => (
    <button
      onClick={() =>
        onSubmit({ title: 'New article', body: 'Content', is_published: false })
      }
    >
      Submit form
    </button>
  ),
}));

vi.mock('@/components/news/AddNewsToCalendarModal', () => ({
  AddNewsToCalendarModal: () => <div>AddNewsToCalendarModal</div>,
}));

const mockUseNews = vi.fn();
const mockUseCreateNews = vi.fn();

vi.mock('@/hooks/useNews', () => ({
  useNews: (...args: unknown[]) => mockUseNews(...args),
  useCreateNews: (...args: unknown[]) => mockUseCreateNews(...args),
  useDeleteNews: () => ({ mutate: vi.fn(), isPending: false }),
  useToggleNewsPublished: () => ({ mutate: vi.fn(), isPending: false }),
}));

const mockNews = [
  {
    id: 'news-1',
    author_id: 'user-1',
    title: 'IELTS Prep Webinar',
    body: 'Join us for...',
    cover_url: null,
    category: 'webinar' as const,
    event_date: null,
    external_url: null,
    is_published: true,
    views_count: 42,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  },
];

describe('NewsPage', () => {
  beforeEach(() => {
    mockUseCreateNews.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });
  });

  it('renders page title and news item in table', () => {
    mockUseNews.mockReturnValue({ data: mockNews });

    render(<NewsPage />);

    expect(screen.getByText('Новости')).toBeInTheDocument();
    // Title appears as a row in the table
    expect(screen.getByText('IELTS Prep Webinar')).toBeInTheDocument();
  });

  it('shows status badge for published news', () => {
    mockUseNews.mockReturnValue({ data: mockNews });

    render(<NewsPage />);

    expect(screen.getByText('ОПУБЛИКОВАН')).toBeInTheDocument();
  });

  it('shows empty state when no news', () => {
    mockUseNews.mockReturnValue({ data: [] });

    render(<NewsPage />);

    expect(screen.getByText('Нет новостей')).toBeInTheDocument();
  });

  it('toggles create form when + Новость button is clicked', async () => {
    const user = userEvent.setup();
    mockUseNews.mockReturnValue({ data: [] });

    render(<NewsPage />);

    expect(screen.queryByText('Submit form')).not.toBeInTheDocument();

    // Button label is "Новость" (with Plus icon)
    await user.click(screen.getByRole('button', { name: /Новость/ }));

    expect(screen.getByText('Submit form')).toBeInTheDocument();
  });

  it('filters to only published news on the Опубликованные tab', async () => {
    const user = userEvent.setup();
    const mixedNews = [
      { ...mockNews[0], id: 'n1', is_published: true },
      { ...mockNews[0], id: 'n2', title: 'Draft Article', is_published: false },
    ];
    mockUseNews.mockReturnValue({ data: mixedNews });

    render(<NewsPage />);

    // Click the "Опубликованные" tab
    await user.click(screen.getByRole('button', { name: 'Опубликованные' }));

    expect(screen.getByText('IELTS Prep Webinar')).toBeInTheDocument();
    expect(screen.queryByText('Draft Article')).not.toBeInTheDocument();
  });
});
