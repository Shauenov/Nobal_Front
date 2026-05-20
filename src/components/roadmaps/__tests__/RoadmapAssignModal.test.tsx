'use client';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoadmapAssignModal } from '../RoadmapAssignModal';

const templateTasks = [
  { id: 'tt1', roadmap_id: 'r1', title: 'Task A', description: 'Do A', order_index: 0, days_offset: 0, created_at: new Date().toISOString() },
  { id: 'tt2', roadmap_id: 'r1', title: 'Task B', description: 'Do B', order_index: 1, days_offset: 7, created_at: new Date().toISOString() },
];

test('submits assign modal with student id', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();

  render(<RoadmapAssignModal isOpen={true} onClose={onClose} templateTasks={templateTasks} onSubmit={onSubmit} />);

  await user.type(screen.getByPlaceholderText('Введите ID студента'), 'student-123');

  // Submit without deadlines
  await user.click(screen.getByRole('button', { name: /назначить маршрут/i }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ student_id: 'student-123' }));
});
