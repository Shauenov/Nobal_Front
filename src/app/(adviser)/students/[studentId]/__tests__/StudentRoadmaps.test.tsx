import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StudentRoadmapsPage from '../roadmaps/page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ studentId: 'student-1' }),
}));

const mockUseStudentRoadmaps = vi.fn();

vi.mock('@/hooks/useRoadmaps', () => ({
  useStudentRoadmaps: (...args: unknown[]) => mockUseStudentRoadmaps(...args),
}));

describe('StudentRoadmapsPage', () => {
  it('renders assigned roadmaps with title and active badge', () => {
    mockUseStudentRoadmaps.mockReturnValue({
      data: [
        {
          id: 'rm-1',
          student_id: 'student-1',
          roadmap_id: 'tpl-1',
          assigned_by: 'ADVISER-1',
          title: 'UK Application Roadmap',
          assigned_at: '2026-01-15T00:00:00.000Z',
          is_active: true,
        },
        {
          id: 'rm-2',
          student_id: 'student-1',
          roadmap_id: 'tpl-2',
          assigned_by: 'ADVISER-1',
          title: 'IELTS Preparation',
          assigned_at: '2026-02-01T00:00:00.000Z',
          is_active: false,
        },
      ],
      isLoading: false,
    });

    render(<StudentRoadmapsPage />);

    expect(screen.getByText('UK Application Roadmap')).toBeInTheDocument();
    expect(screen.getByText('IELTS Preparation')).toBeInTheDocument();
    expect(screen.getByText('Активен')).toBeInTheDocument();
    expect(screen.getByText('Неактивен')).toBeInTheDocument();
  });

  it('shows empty state when no roadmaps assigned', () => {
    mockUseStudentRoadmaps.mockReturnValue({ data: [], isLoading: false });

    render(<StudentRoadmapsPage />);

    expect(screen.getByText('Маршруты не назначены.')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseStudentRoadmaps.mockReturnValue({ data: undefined, isLoading: true });

    render(<StudentRoadmapsPage />);

    expect(screen.getByText('Загрузка маршрутов...')).toBeInTheDocument();
  });
});
