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

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateTaskList } from '../TemplateTaskList';

const mockTasks = [
  { id: 't1', title: 'Task One', description: 'First', order_index: 0, days_offset: 0 },
  { id: 't2', title: 'Task Two', description: '', order_index: 1, days_offset: 7 },
];

test('renders tasks and calls onTasksChange when removing', async () => {
  const user = userEvent.setup();
  const onTasksChange = vi.fn();

  render(<TemplateTaskList tasks={mockTasks} onTasksChange={onTasksChange} isEditable />);

  expect(screen.getByText('Task One')).toBeInTheDocument();
  expect(screen.getByText('Task Two')).toBeInTheDocument();

  const removeButtons = screen.getAllByRole('button', { name: /remove/i });
  await user.click(removeButtons[0]);

  expect(onTasksChange).toHaveBeenCalled();
});
