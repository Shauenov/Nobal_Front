import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import TasksPage from '../page';

vi.mock('@/components/layout/PageHeader', () => ({
  PageHeader: ({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {action}
    </div>
  ),
}));

vi.mock('@/components/tasks/TaskList', () => ({
  TaskList: ({ tasks }: { tasks: { id: string; title: string }[] }) => (
    <ul>{tasks.map((t) => <li key={t.id}>{t.title}</li>)}</ul>
  ),
}));

vi.mock('@/components/tasks/TaskBoard', () => ({
  TaskBoard: ({ tasks }: { tasks: { id: string; title: string }[] }) => (
    <ul>{tasks.map((t) => <li key={t.id}>{t.title}</li>)}</ul>
  ),
}));

vi.mock('@/components/tasks/ViewToggle', () => ({
  ViewToggle: () => <div>ViewToggle</div>,
}));

vi.mock('@/components/tasks/TaskModal', () => ({
  TaskModal: () => null,
}));

const mockUseStudents = vi.fn();
const mockUseStudentTasks = vi.fn();
const mockUsePatchTaskStatus = vi.fn();

vi.mock('@/hooks/useStudents', () => ({
  useStudents: (...args: unknown[]) => mockUseStudents(...args),
}));

vi.mock('@/hooks/useTasks', () => ({
  useStudentTasks: (...args: unknown[]) => mockUseStudentTasks(...args),
  usePatchTaskStatus: () => mockUsePatchTaskStatus(),
}));

const mockStudents = [
  { id: 'student-1', full_name: 'Иван Петров', group_type: 'D', course_year: 2 },
  { id: 'student-2', full_name: 'Мария Сидорова', group_type: 'F', course_year: 3 },
];

const mockTasks = [
  {
    id: 'task-1',
    student_id: 'student-1',
    created_by: 'conductor-1',
    title: 'Submit transcript',
    description: null,
    status: 'todo',
    priority: 'high',
    task_type: 'assignment',
    deadline: null,
    time_from: null,
    time_to: null,
    location: null,
    reminder_minutes: null,
    completed_at: null,
    is_conductor_task: true,
    student_roadmap_id: null,
    created_at: '2026-05-01T00:00:00.000Z',
    updated_at: '2026-05-01T00:00:00.000Z',
  },
];

describe('TasksPage', () => {
  beforeEach(() => {
    vi.useRealTimers();
    mockUseStudents.mockReturnValue({ data: { data: mockStudents }, isLoading: false });
    mockUseStudentTasks.mockReturnValue({ data: { data: [] }, isLoading: false });
    mockUsePatchTaskStatus.mockReturnValue({ mutate: vi.fn() });
  });

  it('shows student selector and empty placeholder before selecting', () => {
    render(<TasksPage />);

    expect(screen.getByText('Задания')).toBeInTheDocument();
    expect(screen.getByText('Выберите студента')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Иван Петров/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Мария Сидорова/ })).toBeInTheDocument();
  });

  it('shows tasks after selecting a student', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    mockUseStudentTasks.mockReturnValue({ data: { data: mockTasks }, isLoading: false });

    render(<TasksPage />);

    await user.selectOptions(screen.getByRole('combobox'), 'student-1');

    expect(screen.getByText('Submit transcript')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Создать задание' })).toBeInTheDocument();
  });

  it('shows empty state message for a student with no tasks', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    mockUseStudentTasks.mockReturnValue({ data: { data: [] }, isLoading: false });

    render(<TasksPage />);

    await user.selectOptions(screen.getByRole('combobox'), 'student-1');

    expect(screen.getByText(/Создать первое задание/)).toBeInTheDocument();
  });
});
