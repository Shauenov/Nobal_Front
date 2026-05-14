'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import type { CSSProperties } from 'react';
import { TaskOut, TaskStatus } from '@/types/api';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  tasks: TaskOut[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick?: (task: TaskOut) => void;
}

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const boardStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 'var(--space-4)',
  alignItems: 'flex-start',
};

const columnStyle: CSSProperties = {
  background: 'var(--color-surface-hover)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-3)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
  minHeight: '200px',
};

function DroppableColumn({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...columnStyle,
        border: isOver ? '1px dashed var(--color-primary)' : '1px solid transparent',
      }}
    >
      <div style={{ fontWeight: 'var(--font-semibold)', paddingBottom: 'var(--space-2)' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function DraggableTask({ task, onClick }: { task: TaskOut; onClick?: (task: TaskOut) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}

export function TaskBoard({ tasks, onTaskStatusChange, onTaskClick }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskOut | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeTask = tasks.find((t) => t.id === active.id);
      const newStatus = over.id as TaskStatus;
      if (activeTask && activeTask.status !== newStatus) {
        onTaskStatusChange(activeTask.id, newStatus);
      }
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={boardStyle}>
        {COLUMNS.map((col) => (
          <DroppableColumn key={col.id} id={col.id} title={col.title}>
            {tasks
              .filter((t) => t.status === col.id)
              .map((task) => (
                <DraggableTask key={task.id} task={task} onClick={onTaskClick} />
              ))}
          </DroppableColumn>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
