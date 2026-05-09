'use client';

import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { RoadmapTemplateTaskCreate, RoadmapTemplateTaskOut } from '@/types/api';

interface TemplateTaskListProps {
  tasks: (RoadmapTemplateTaskOut | RoadmapTemplateTaskCreate)[];
  onTasksChange: (tasks: (RoadmapTemplateTaskOut | RoadmapTemplateTaskCreate)[]) => void;
  isEditable?: boolean;
  isLoading?: boolean;
}

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const taskItemStyle: CSSProperties = {
  background: 'var(--color-surface-hover)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3)',
  display: 'flex',
  gap: 'var(--space-2)',
  alignItems: 'flex-start',
};

const dragHandleStyle: CSSProperties = {
  cursor: 'grab',
  color: 'var(--color-text-secondary)',
  fontSize: '20px',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const taskContentStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
};

const titleStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  color: 'var(--color-text-primary)',
};

const descriptionStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
};

const metricsStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-3)',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
};

const buttonStyle = (disabled?: boolean): CSSProperties => ({
  padding: '4px 8px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  border: '1px solid var(--color-border)',
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  opacity: disabled ? 0.5 : 1,
});

interface SortableTaskItemProps {
  task: RoadmapTemplateTaskOut | RoadmapTemplateTaskCreate;
  index: number;
  isEditable?: boolean;
  onDelete?: (index: number) => void;
  isLoading?: boolean;
}

function SortableTaskItem({ task, index, isEditable, onDelete, isLoading }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={{ ...taskItemStyle, ...style }}>
      {isEditable && (
        <div style={dragHandleStyle} {...attributes} {...listeners}>
          ⋮⋮
        </div>
      )}
      <div style={taskContentStyle}>
        <div style={titleStyle}>{task.title}</div>
        {task.description && <div style={descriptionStyle}>{task.description}</div>}
        <div style={metricsStyle}>
          <span>Order: {task.order_index}</span>
          {task.days_offset !== null && task.days_offset !== undefined && (
            <span>Days offset: +{task.days_offset}</span>
          )}
        </div>
      </div>
      {isEditable && onDelete && (
        <button
          style={buttonStyle(isLoading)}
          onClick={() => onDelete(index)}
          disabled={isLoading}
        >
          Remove
        </button>
      )}
    </div>
  );
}

export function TemplateTaskList({
  tasks,
  onTasksChange,
  isEditable = false,
  isLoading = false,
}: TemplateTaskListProps) {
  const [localTasks, setLocalTasks] = useState(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const taskIds = useMemo(() => localTasks.map((_, i) => i.toString()), [localTasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id as string);
      const newIndex = parseInt(over.id as string);

      const newTasks = arrayMove(localTasks, oldIndex, newIndex);
      // Update order_index for all tasks
      const updatedTasks = newTasks.map((task, idx) => ({
        ...task,
        order_index: idx,
      }));

      setLocalTasks(updatedTasks);
      onTasksChange(updatedTasks);
    }
  };

  const handleDeleteTask = (index: number) => {
    const newTasks = localTasks
      .filter((_, i) => i !== index)
      .map((task, idx) => ({
        ...task,
        order_index: idx,
      }));

    setLocalTasks(newTasks);
    onTasksChange(newTasks);
  };

  if (localTasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
        No template tasks yet
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div style={listStyle}>
          {localTasks.map((task, index) => (
            <SortableTaskItem
              key={index}
              task={task}
              index={index}
              isEditable={isEditable}
              onDelete={isEditable ? handleDeleteTask : undefined}
              isLoading={isLoading}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
