import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TaskOut } from '@/types/api';
import { TaskCard } from '../TaskCard';

const task: TaskOut = {
  id: 'task-1',
  student_id: 'student-1',
  created_by: 'ADVISER-1',
  title: 'Prepare IELTS documents',
  description: 'Collect all supporting files and submit them before the deadline.',
  status: 'todo',
  priority: 'high',
  task_type: 'assignment',
  deadline: '2020-01-01T00:00:00.000Z',
  time_from: null,
  time_to: null,
  location: null,
  reminder_minutes: null,
  completed_at: null,
  is_adviser_task: true,
  student_roadmap_id: null,
  created_at: '2026-05-08T00:00:00.000Z',
  updated_at: '2026-05-08T00:00:00.000Z',
};

describe('TaskCard', () => {
  it('renders the task and calls click handler', () => {
    const onClick = vi.fn();

    render(<TaskCard task={task} onClick={onClick} />);

    fireEvent.click(screen.getByText('Prepare IELTS documents'));

    expect(screen.getByText('Prepare IELTS documents')).toBeInTheDocument();
    expect(onClick).toHaveBeenCalledWith(task);
  });
});