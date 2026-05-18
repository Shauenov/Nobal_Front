import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StudentOverviewPage from '../page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ studentId: 'student-1' }),
}));

const mockUseStudent = vi.fn();

vi.mock('@/hooks/useStudents', () => ({
  useStudent: (...args: unknown[]) => mockUseStudent(...args),
}));

const mockStudent = {
  user: {
    id: 'student-1',
    email: 'ivan@example.com',
    full_name: 'Иван Петров',
    role: 'student',
    is_active: true,
    avatar_url: null,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  profile: {
    id: 'profile-1',
    user_id: 'student-1',
    group_type: 'D' as const,
    course_year: 2,
    gpa: '3.85',
    ielts_passed: true,
    ielts_score: '7.0',
    ielts_date: null,
    sat_passed: false,
    sat_score: null,
    sat_date: null,
    ent_score: null,
    kta_score: null,
    target_country: 'UK',
    target_major: 'Computer Science',
    notes: null,
    phone: null,
    gender: null,
    birth_date: null,
    school_name: null,
    degree_level: null,
    target_countries: [],
    budget_max: null,
  },
  documents: [],
  active_roadmap: null,
  tasks_summary: { todo: 3, done: 7 },
  next_appointment: null,
};

describe('StudentOverviewPage', () => {
  it('renders profile snapshot and task summary for a student', () => {
    mockUseStudent.mockReturnValue({ data: mockStudent, isLoading: false });

    render(<StudentOverviewPage />);

    expect(screen.getByText(/Group:/)).toBeInTheDocument();
    expect(screen.getByText(/D/)).toBeInTheDocument();
    expect(screen.getByText(/GPA:/)).toBeInTheDocument();
    expect(screen.getByText(/3.85/)).toBeInTheDocument();
    expect(screen.getByText(/Passed/)).toBeInTheDocument();
    expect(screen.getByText('todo')).toBeInTheDocument();
    expect(screen.getByText('done')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('No upcoming appointment.')).toBeInTheDocument();
    expect(screen.getByText('No active roadmap.')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseStudent.mockReturnValue({ data: undefined, isLoading: true });

    render(<StudentOverviewPage />);

    expect(screen.getByText('Loading overview...')).toBeInTheDocument();
  });

  it('shows not-found state when data is null', () => {
    mockUseStudent.mockReturnValue({ data: null, isLoading: false });

    render(<StudentOverviewPage />);

    expect(screen.getByText('Student not found.')).toBeInTheDocument();
  });
});
