'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { RoadmapTemplateTaskOut, AssignRequest } from '@/types/api';

interface RoadmapAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateTasks?: RoadmapTemplateTaskOut[];
  onSubmit: (data: AssignRequest) => Promise<void>;
  isLoading?: boolean;
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
  width: '100%',
  maxWidth: '600px',
  boxShadow: 'var(--shadow-lg)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  fontSize: 'var(--text-sm)',
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  color: 'var(--color-text-primary)',
};

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const errorStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-error)',
  marginTop: '4px',
};

const taskOverrideStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  padding: 'var(--space-3)',
  background: 'var(--color-surface-hover)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
};

const taskTitleStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
};

const buttonGroupStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 'var(--space-3)',
  marginTop: 'var(--space-4)',
};

const buttonStyle = (variant: 'primary' | 'ghost', disabled?: boolean): CSSProperties => ({
  padding: '10px 16px',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  border: 'none',
  background: variant === 'primary' ? (disabled ? 'var(--color-border)' : 'var(--color-primary)') : 'transparent',
  color: variant === 'primary' ? '#fff' : 'var(--color-text-primary)',
  opacity: disabled ? 0.6 : 1,
});

const assignSchema = z.object({
  student_id: z.string().min(1, 'Student ID is required'),
});

type AssignFormData = z.infer<typeof assignSchema>;

export function RoadmapAssignModal({
  isOpen,
  onClose,
  templateTasks = [],
  onSubmit,
  isLoading = false,
}: RoadmapAssignModalProps) {
  const [taskDeadlines, setTaskDeadlines] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<AssignFormData>({
    resolver: zodResolver(assignSchema),
    mode: 'onChange',
  });

  if (!isOpen) return null;

  const handleFormSubmit = async (data: AssignFormData) => {
    try {
      const customize_tasks = templateTasks
        .map((task) => {
          const deadline = taskDeadlines[task.id];
          return deadline ? { template_task_id: task.id, deadline } : null;
        })
        .filter(Boolean) as Array<{ template_task_id: string; deadline: string }>;

      await onSubmit({
        student_id: data.student_id,
        customize_tasks: customize_tasks.length > 0 ? customize_tasks : undefined,
      });

      reset();
      setTaskDeadlines({});
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
          Assign Roadmap
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>
              ID студента <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              {...register('student_id')}
              type="text"
              placeholder="Введите ID студента"
              style={inputStyle}
            />
            {errors.student_id && <div style={errorStyle}>{errors.student_id.message}</div>}
          </div>

          {templateTasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={labelStyle}>Optional: Override Task Deadlines</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {templateTasks.map((task) => (
                  <div key={task.id} style={taskOverrideStyle}>
                    <div style={taskTitleStyle}>{task.title}</div>
                    {task.description && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                        {task.description}
                      </div>
                    )}
                    <input
                      type="datetime-local"
                      value={taskDeadlines[task.id] || ''}
                      onChange={(e) =>
                        setTaskDeadlines((prev) => ({
                          ...prev,
                          [task.id]: e.target.value,
                        }))
                      }
                      style={inputStyle}
                      placeholder="Срок (необязательно)"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={buttonGroupStyle}>
            <button
              type="button"
              style={buttonStyle('ghost')}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={buttonStyle('primary', !isValid || isLoading)}
              disabled={!isValid || isLoading}
            >
              {isLoading ? 'Назначение...' : 'Назначить маршрут'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
