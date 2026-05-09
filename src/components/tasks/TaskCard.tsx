import type { CSSProperties } from 'react';
import { useState } from 'react';
import { TaskOut } from '@/types/api';

interface TaskCardProps {
  task: TaskOut;
  onClick?: (task: TaskOut) => void;
}

const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3)',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  boxShadow: 'var(--shadow-sm)',
  transition: 'all 0.2s',
};

const badgeStyle = (color: string): CSSProperties => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  background: color,
  color: '#fff',
});

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'var(--color-error)';
    case 'medium':
      return 'var(--color-warning)';
    case 'low':
      return 'var(--color-info)';
    default:
      return 'var(--color-text-secondary)';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo':
      return 'var(--color-text-secondary)';
    case 'in_progress':
      return 'var(--color-primary)';
    case 'done':
      return 'var(--color-success)';
    default:
      return 'var(--color-text-secondary)';
  }
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const [now] = useState(() => Date.now());
  const isOverdue = task.deadline && new Date(task.deadline).getTime() < now && task.status !== 'done';

  return (
    <div
      style={{
        ...cardStyle,
        borderColor: isOverdue ? 'var(--color-error)' : 'var(--color-border)',
      }}
      onClick={() => onClick?.(task)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>
          {task.title}
        </div>
        <div style={badgeStyle(getPriorityColor(task.priority))}>{task.priority}</div>
      </div>
      
      {task.description && (
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.description}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'var(--space-2)',
        }}
      >
        <div style={badgeStyle(getStatusColor(task.status))}>{task.status.replace('_', ' ')}</div>
        {task.deadline && (
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: isOverdue ? 'var(--color-error)' : 'var(--color-text-secondary)',
            }}
          >
            {new Date(task.deadline).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
