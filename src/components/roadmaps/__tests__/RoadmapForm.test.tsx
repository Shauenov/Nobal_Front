'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => children,
  closestCenter: () => null,
  PointerSensor: function PointerSensor() {},
  KeyboardSensor: function KeyboardSensor() {},
  useSensor: () => () => null,
  useSensors: () => [],
}));

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: (arr: any) => arr,
  SortableContext: ({ children }: any) => children,
  sortableKeyboardCoordinates: () => null,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  verticalListSortingStrategy: () => null,
}));

vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }));
/* eslint-enable @typescript-eslint/no-explicit-any */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoadmapForm } from '../RoadmapForm';

test('creates roadmap with template tasks', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);

  render(<RoadmapForm onSubmit={onSubmit} />);

  // Fill title
  await user.type(screen.getByPlaceholderText('Название маршрута'), 'My Roadmap');

  // Add a task
  await user.type(screen.getByPlaceholderText('Название задачи'), 'First task');
  await user.click(screen.getByRole('button', { name: /добавить задачу/i }));

  // Submit
  await user.click(screen.getByRole('button', { name: /создать маршрут/i }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalled());

  const call = onSubmit.mock.calls[0][0];
  expect(call).toEqual(expect.objectContaining({
    title: 'My Roadmap',
    template_tasks: expect.any(Array),
  }));
  expect(call.template_tasks[0]).toEqual(expect.objectContaining({ title: 'First task' }));
}, 20000);
