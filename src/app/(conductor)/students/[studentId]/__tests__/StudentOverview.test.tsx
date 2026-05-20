import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StudentOverviewPage from '../page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ studentId: 'student-1' }),
}));

// lucide-react icons — stub so JSDOM doesn't fail on SVG
vi.mock('lucide-react', () => ({
  CalendarCheck: () => null,
  BookOpen:      () => null,
  CheckCircle:   () => null,
  Clock:         () => null,
  AlertCircle:   () => null,
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
    notes: 'Some notes here',
    phone: null,
    gender: null,
    birth_date: null,
    school_name: null,
    degree_level: null,
    target_countries: ['США', 'Германия'],
    budget_max: null,
  },
  documents: [],
  active_roadmap: null,
  tasks_summary: { pending: 3, completed: 7 },
  next_appointment: null,
};

describe('StudentOverviewPage', () => {
  it('renders profile snapshot and task summary for a student', () => {
    mockUseStudent.mockReturnValue({ data: mockStudent, isLoading: false });

    render(<StudentOverviewPage />);

    // Stat chips
    expect(screen.getByText('GPA')).toBeInTheDocument();
    // toFixed(1) rounds 3.85 → 3.9 in most environments
    expect(screen.getByText(/3\.[89]/)).toBeInTheDocument();
    expect(screen.getByText('Балл IELTS')).toBeInTheDocument();
    // ielts_score '7.0' rendered as-is
    expect(screen.getByText('7.0')).toBeInTheDocument();

    // Profile card — row label
    expect(screen.getByText('Группа')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();

    // Task summary
    expect(screen.getByText('Ожидает')).toBeInTheDocument();
    expect(screen.getByText('Завершено')).toBeInTheDocument();

    // Empty states
    expect(screen.getByText('Нет предстоящих консультаций')).toBeInTheDocument();
    expect(screen.getByText('Нет активного маршрута')).toBeInTheDocument();

    // Target countries chips
    expect(screen.getByText('США')).toBeInTheDocument();

    // Notes
    expect(screen.getByText('Some notes here')).toBeInTheDocument();
  });

  it('shows loading skeleton without crashing', () => {
    mockUseStudent.mockReturnValue({ data: undefined, isLoading: true });

    const { container } = render(<StudentOverviewPage />);

    // Loading renders placeholder div grid — no text, but component mounts
    expect(container.firstChild).toBeTruthy();
  });

  it('shows not-found state when data is null', () => {
    mockUseStudent.mockReturnValue({ data: null, isLoading: false });

    render(<StudentOverviewPage />);

    expect(screen.getByText('Данные студента недоступны')).toBeInTheDocument();
  });
});
