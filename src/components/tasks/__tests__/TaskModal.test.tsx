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
  useTaskHistory: () => ({ data: [], isLoading: false }),
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

    await user.type(screen.getByLabelText('Название'), 'Prepare transcript');
    await user.type(screen.getByLabelText('Описание'), 'Collect and scan the transcript.');
    await user.selectOptions(screen.getByLabelText('Приоритет'), 'high');
    await user.type(screen.getByLabelText('Дедлайн'), '2026-06-01T10:30');
    await user.click(screen.getByRole('button', { name: 'Создать задание' }));
    const expectedDeadline = new Date('2026-06-01T10:30').toISOString();

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        title: 'Prepare transcript',
        description: 'Collect and scan the transcript.',
        priority: 'high',
        deadline: expectedDeadline,
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    }, { timeout: 10000 });
  });

  it('deletes an existing task', async () => {
    vi.useRealTimers();
    const onClose = vi.fn();
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    deleteTask.mockImplementation((_id: string, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    });

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
          task_type: 'assignment',
          deadline: null,
          time_from: null,
          time_to: null,
          location: null,
          reminder_minutes: null,
          completed_at: null,
          is_conductor_task: true,
          student_roadmap_id: null,
          created_at: '2026-05-09T00:00:00.000Z',
          updated_at: '2026-05-09T00:00:00.000Z',
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Удалить' }));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('Удалить задание?');
      expect(deleteTask).toHaveBeenCalledWith('task-1', expect.any(Object));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    confirmSpy.mockRestore();
  });
});
