import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StudentsPage from '../page';

const replace = vi.fn();
const searchParams = new URLSearchParams('group_type=D&course_year=2&page=2');

vi.mock('next/navigation', () => ({
  usePathname: () => '/students',
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (!values) return key;
    return Object.entries(values).reduce(
      (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
      key
    );
  },
}));

vi.mock('@/hooks/useStudents', () => ({
  useDeleteStudent: () => ({ mutate: vi.fn() }),
  useStudents: () => ({
    data: {
      data: [
        {
          id: 'student-1',
          full_name: 'Anna Smith',
          email: 'anna@example.com',
          group_type: 'D',
          course_year: 2,
          gpa: 3.9,
          ielts_passed: true,
          sat_passed: false,
          avatar_url: null,
          tasks_total: 4,
          tasks_done: 2,
          unread_messages: 1,
        },
      ],
      meta: { page: 2, page_size: 20, total: 20 },
    },
    isLoading: false,
  }),
}));

vi.mock('@/components/layout/PageHeader', () => ({
  PageHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  ),
}));

vi.mock('@/components/students/StudentGrid', () => ({
  StudentGrid: ({ students }: { students: Array<{ full_name: string }> }) => (
    <div data-testid="student-grid">{students[0]?.full_name}</div>
  ),
}));

vi.mock('@/components/students/InviteModal', () => ({
  InviteModal: () => null,
}));

describe('StudentsPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    replace.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates the URL search params after the search debounce', () => {
    render(<StudentsPage />);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    replace.mockClear();

    fireEvent.change(screen.getByPlaceholderText('Поиск по имени...'), {
      target: { value: 'Annabelle' },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(replace).toHaveBeenCalledWith('/students?group_type=D&course_year=2&page=1&search=Annabelle');
  });
});