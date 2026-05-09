import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskModal } from '../TaskModal';

const createTask = vi.fn();
const updateTask = vi.fn();
const deleteTask = vi.fn();

vi.mock('@/hooks/useTasks', () => ({
  useCreateTask: () => ({ mutateAsync: createTask, isPending: false }),
  useUpdateTask: () => ({ mutateAsync: updateTask, isPending: false }),
  useDeleteTask: () => ({ mutate: deleteTask, isPending: false }),
}));

describe('TaskModal', () => {
  beforeEach(() => {
    createTask.mockReset();
    updateTask.mockReset();
    deleteTask.mockReset();
  });

  it('creates a task for the student', async () => {
    vi.useRealTimers();
    const onClose = vi.fn();
    const user = userEvent.setup();
    createTask.mockResolvedValue({});

    render(<TaskModal open onClose={onClose} studentId="student-1" />);

    await user.type(screen.getByLabelText('Title'), 'Prepare transcript');
    await user.type(screen.getByLabelText('Description'), 'Collect and scan the transcript.');
    await user.selectOptions(screen.getByLabelText('Priority'), 'high');
    await user.type(screen.getByLabelText('Deadline'), '2026-06-01T10:30');
    await user.click(screen.getByRole('button', { name: 'Create Task' }));
    const expectedDeadline = new Date('2026-06-01T10:30').toISOString();

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        title: 'Prepare transcript',
        description: 'Collect and scan the transcript.',
        priority: 'high',
        deadline: expectedDeadline,
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    }, 10000);
  });

  it('deletes an existing task', async () => {
    vi.useRealTimers();
    const onClose = vi.fn();
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    deleteTask.mockImplementation((_id: string, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    }, 10000);

    render(
      <TaskModal
        open
        onClose={onClose}
        studentId="student-1"
        initialTask={{
          id: 'task-1',
          student_id: 'student-1',
          created_by: 'conductor-1',
          title: 'Upload documents',
          description: 'Send the scanned copies',
          status: 'todo',
          priority: 'medium',
          deadline: null,
          completed_at: null,
          is_conductor_task: true,
          student_roadmap_id: null,
          created_at: '2026-05-09T00:00:00.000Z',
          updated_at: '2026-05-09T00:00:00.000Z',
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('Delete this task?');
      expect(deleteTask).toHaveBeenCalledWith('task-1', expect.any(Object));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    confirmSpy.mockRestore();
  });
});