import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '../page';
import { queryClient } from '@/lib/queryClient';
import * as reportsHook from '@/hooks/useReports';
import * as studentsHook from '@/hooks/useStudents';

// Mock the hooks
vi.mock('@/hooks/useReports');
vi.mock('@/hooks/useStudents');

const mockUseOverviewReport = reportsHook.useOverviewReport as ReturnType<typeof vi.fn>;
const mockUseStudents = studentsHook.useStudents as ReturnType<typeof vi.fn>;

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state for overview report', () => {
    mockUseOverviewReport.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    mockUseStudents.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Панель управления')).toBeInTheDocument();
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
  });

  it('renders dashboard with overview report data', async () => {
    const mockReport = {
      total_students: 125,
      ielts_passed: 45,
      sat_passed: 32,
      avg_gpa: 3.7,
      tasks_completed_this_month: 89,
      appointments_this_month: 15,
      applied_abroad: 72,
      by_group: { 'Group A': 50, 'Group B': 75 },
    };

    mockUseOverviewReport.mockReturnValue({
      data: mockReport,
      isLoading: false,
      error: null,
    });
    mockUseStudents.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<DashboardPage />);

    // Check header
    expect(screen.getByText('Панель управления')).toBeInTheDocument();
    expect(
      screen.getByText('Отслеживайте прогресс и успеваемость студентов 2–3 курсов')
    ).toBeInTheDocument();

    // Check metric cards are present
    expect(screen.getByText('Всего учащихся')).toBeInTheDocument();
    expect(screen.getByText('Объем грантов')).toBeInTheDocument();
    expect(screen.getByText('Средние SAT')).toBeInTheDocument();
    expect(screen.getByText('Средние IELTS')).toBeInTheDocument();

    // Check metric values render
    expect(screen.getByText('125')).toBeInTheDocument();
  });

  it('renders students table with data', () => {
    mockUseOverviewReport.mockReturnValue({
      data: {
        total_students: 125,
        ielts_passed: 45,
        sat_passed: 32,
        avg_gpa: 3.7,
        tasks_completed_this_month: 89,
        appointments_this_month: 15,
        applied_abroad: 72,
        by_group: {},
      },
      isLoading: false,
      error: null,
    });

    const mockStudents = [
      {
        id: 'student-1',
        full_name: 'Иван Петров',
        course_year: 2,
        gpa: 3.85,
        group_type: 'Type A',
        ielts_passed: true,
        sat_passed: false,
        tasks_total: 10,
        tasks_done: 8,
        tasks_overdue: 0,
      },
      {
        id: 'student-2',
        full_name: 'Мария Сидорова',
        course_year: 3,
        gpa: 3.92,
        group_type: 'Type B',
        ielts_passed: true,
        sat_passed: true,
        tasks_total: 12,
        tasks_done: 11,
        tasks_overdue: 1,
      },
    ];

    mockUseStudents.mockReturnValue({
      data: mockStudents,
      isLoading: false,
      error: null,
    });

    renderWithProviders(<DashboardPage />);

    // Check table headers
    expect(screen.getByText('ИМЯ СТУДЕНТА')).toBeInTheDocument();
    expect(screen.getByText('КУРС')).toBeInTheDocument();
    expect(screen.getByText('GPA')).toBeInTheDocument();

    // Check table data
    expect(screen.getByText('Иван Петров')).toBeInTheDocument();
    expect(screen.getByText('Мария Сидорова')).toBeInTheDocument();
    expect(screen.getByText('2-й курс')).toBeInTheDocument();
    expect(screen.getByText('3.85')).toBeInTheDocument();
  });

  it('handles empty students list', () => {
    mockUseOverviewReport.mockReturnValue({
      data: {
        total_students: 0,
        ielts_passed: 0,
        sat_passed: 0,
        avg_gpa: null,
        tasks_completed_this_month: 0,
        appointments_this_month: 0,
        applied_abroad: 0,
        by_group: {},
      },
      isLoading: false,
      error: null,
    });

    mockUseStudents.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Нет студентов.')).toBeInTheDocument();
  });

  it('renders engagement chart with correct data', () => {
    mockUseOverviewReport.mockReturnValue({
      data: {
        total_students: 100,
        ielts_passed: 45,
        sat_passed: 32,
        avg_gpa: 3.7,
        tasks_completed_this_month: 89,
        appointments_this_month: 15,
        applied_abroad: 72,
        by_group: {},
      },
      isLoading: false,
      error: null,
    });

    mockUseStudents.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<DashboardPage />);

    // Check engagement section title
    expect(screen.getByText('Вовлечённость')).toBeInTheDocument();

    // Check engagement labels
    expect(screen.getByText(/Активные учащиеся/)).toBeInTheDocument();
    expect(screen.getByText(/Неактивные учащиеся/)).toBeInTheDocument();

    // Engagement percent should be calculated: 77 active out of 100 = 77%
    expect(screen.getByText('77%')).toBeInTheDocument();
  });

  it('allows period selection toggle', async () => {
    mockUseOverviewReport.mockReturnValue({
      data: {
        total_students: 125,
        ielts_passed: 45,
        sat_passed: 32,
        avg_gpa: 3.7,
        tasks_completed_this_month: 89,
        appointments_this_month: 15,
        applied_abroad: 72,
        by_group: {},
      },
      isLoading: false,
      error: null,
    });

    mockUseStudents.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<DashboardPage />);

    // Initially should show "За Месяц"
    expect(screen.getByText(/За Месяц/)).toBeInTheDocument();

    // Find and click the select dropdown
    const select = screen.getByDisplayValue('Месяц') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'quarter' } });

    // After change, should show "За Квартал"
    await waitFor(() => {
      expect(screen.getByDisplayValue('Квартал')).toBeInTheDocument();
    });
  });

  it('formats numbers correctly', () => {
    mockUseOverviewReport.mockReturnValue({
      data: {
        total_students: 1250,
        ielts_passed: 450,
        sat_passed: 320,
        avg_gpa: 3.7,
        tasks_completed_this_month: 89,
        appointments_this_month: 15,
        applied_abroad: 720,
        by_group: {},
      },
      isLoading: false,
      error: null,
    });

    mockUseStudents.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<DashboardPage />);

    // Check that numbers are formatted with thousands separator
    expect(screen.getByText('1,250')).toBeInTheDocument();
  });

  it('displays section titles correctly', () => {
    mockUseOverviewReport.mockReturnValue({
      data: {
        total_students: 125,
        ielts_passed: 45,
        sat_passed: 32,
        avg_gpa: 3.7,
        tasks_completed_this_month: 89,
        appointments_this_month: 15,
        applied_abroad: 72,
        by_group: {},
      },
      isLoading: false,
      error: null,
    });

    mockUseStudents.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Ключевые метрики')).toBeInTheDocument();
    expect(screen.getByText('Лучшие результаты по оферам')).toBeInTheDocument();
    expect(screen.getByText('Вовлечённость')).toBeInTheDocument();
  });

  it('renders select button in results section', () => {
    mockUseOverviewReport.mockReturnValue({
      data: {
        total_students: 125,
        ielts_passed: 45,
        sat_passed: 32,
        avg_gpa: 3.7,
        tasks_completed_this_month: 89,
        appointments_this_month: 15,
        applied_abroad: 72,
        by_group: {},
      },
      isLoading: false,
      error: null,
    });

    mockUseStudents.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<DashboardPage />);

    // Check for "Выбрать..." button in results section
    const selectButtons = screen.getAllByText('Выбрать...');
    expect(selectButtons.length).toBeGreaterThan(0);
  });

  it('shows "Посмотреть все" link when there are students', () => {
    mockUseOverviewReport.mockReturnValue({
      data: {
        total_students: 125,
        ielts_passed: 45,
        sat_passed: 32,
        avg_gpa: 3.7,
        tasks_completed_this_month: 89,
        appointments_this_month: 15,
        applied_abroad: 72,
        by_group: {},
      },
      isLoading: false,
      error: null,
    });

    const mockStudents = [
      {
        id: 'student-1',
        full_name: 'Иван Петров',
        course_year: 2,
        gpa: 3.85,
        group_type: 'Type A',
        ielts_passed: true,
        sat_passed: false,
        tasks_total: 10,
        tasks_done: 8,
        tasks_overdue: 0,
      },
    ];

    mockUseStudents.mockReturnValue({
      data: mockStudents,
      isLoading: false,
      error: null,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Посмотреть все')).toBeInTheDocument();
  });

  it('displays trend indicators with correct direction', () => {
    mockUseOverviewReport.mockReturnValue({
      data: {
        total_students: 125,
        ielts_passed: 45,
        sat_passed: 32,
        avg_gpa: 3.7,
        tasks_completed_this_month: 89,
        appointments_this_month: 15,
        applied_abroad: 72,
        by_group: {},
      },
      isLoading: false,
      error: null,
    });

    mockUseStudents.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<DashboardPage />);

    // Check for trend indicators in metrics
    const trendsText = screen.queryAllByText(/за последние 30 дней/);
    expect(trendsText.length).toBeGreaterThan(0);
  });

  it('handles students loading state', () => {
    mockUseOverviewReport.mockReturnValue({
      data: {
        total_students: 125,
        ielts_passed: 45,
        sat_passed: 32,
        avg_gpa: 3.7,
        tasks_completed_this_month: 89,
        appointments_this_month: 15,
        applied_abroad: 72,
        by_group: {},
      },
      isLoading: false,
      error: null,
    });

    mockUseStudents.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Загрузка студентов...')).toBeInTheDocument();
  });

  it('shows 0% engagement when no students', () => {
    mockUseOverviewReport.mockReturnValue({
      data: {
        total_students: 0,
        ielts_passed: 0,
        sat_passed: 0,
        avg_gpa: null,
        tasks_completed_this_month: 0,
        appointments_this_month: 0,
        applied_abroad: 0,
        by_group: {},
      },
      isLoading: false,
      error: null,
    });

    mockUseStudents.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<DashboardPage />);

    // With 0 total and 0 passed, should show 0%
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
