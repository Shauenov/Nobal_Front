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
  await user.type(screen.getByPlaceholderText('Roadmap title'), 'My Roadmap');

  // Add a task
  await user.type(screen.getByPlaceholderText('Task title'), 'First task');
  await user.click(screen.getByRole('button', { name: /add task/i }));

  // Submit
  await user.click(screen.getByRole('button', { name: /create roadmap/i }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalled());

  const call = onSubmit.mock.calls[0][0];
  expect(call).toEqual(expect.objectContaining({
    title: 'My Roadmap',
    template_tasks: expect.any(Array),
  }));
  expect(call.template_tasks[0]).toEqual(expect.objectContaining({ title: 'First task' }));
}, 10000);
