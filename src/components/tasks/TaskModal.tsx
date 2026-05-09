'use client';

import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateTask, useDeleteTask, useUpdateTask } from '@/hooks/useTasks';
import type { TaskOut, TaskPriority } from '@/types/api';

const taskSchema = z.object({
  title: z.string().min(3, 'Enter a task title'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  deadline: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
  initialTask?: TaskOut | null;
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 15, 26, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 120,
  padding: 'var(--space-4)',
};

const modalStyle: CSSProperties = {
  width: '100%',
  maxWidth: 640,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-6)',
  boxShadow: 'var(--shadow-lg)',
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  color: 'var(--color-text-secondary)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  padding: '10px 12px',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
};

const errorStyle: CSSProperties = {
  color: 'var(--color-error)',
  fontSize: 'var(--text-xs)',
};

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 16);
};

const toIsoOrNull = (value?: string) => (value ? new Date(value).toISOString() : null);

export function TaskModal({ open, onClose, studentId, initialTask }: TaskModalProps) {
  const createTask = useCreateTask(studentId);
  const deleteTask = useDeleteTask(studentId);
  const updateTask = useUpdateTask(studentId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      deadline: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    if (initialTask) {
      reset({
        title: initialTask.title,
        description: initialTask.description ?? '',
        priority: initialTask.priority,
        deadline: toDateTimeLocal(initialTask.deadline),
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        deadline: '',
      });
    }
  }, [open, initialTask, reset]);

  if (!open) return null;

  const isEditing = Boolean(initialTask);
  const isPending = createTask.isPending || updateTask.isPending;

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title,
      description: values.description?.trim() ? values.description : null,
      priority: values.priority as TaskPriority,
      deadline: toIsoOrNull(values.deadline),
    };

    if (isEditing && initialTask) {
      await updateTask.mutateAsync({
        taskId: initialTask.id,
        data: payload,
      });
    } else {
      await createTask.mutateAsync(payload);
    }

    onClose();
  });

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>
            {isEditing ? 'Edit Task' : 'Create Task'}
          </h2>
          <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--color-text-secondary)' }}>
            {isEditing ? 'Update task details and deadline.' : 'Create a new task for this student.'}
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={labelStyle} htmlFor="task-title">Title</label>
              <input id="task-title" style={inputStyle} {...register('title')} />
              {errors.title && <span style={errorStyle}>{errors.title.message}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={labelStyle} htmlFor="task-priority">Priority</label>
              <select id="task-priority" style={inputStyle} {...register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle} htmlFor="task-description">Description</label>
            <textarea id="task-description" rows={4} style={inputStyle} {...register('description')} />
          </div>

          <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={labelStyle} htmlFor="task-deadline">Deadline</label>
              <input id="task-deadline" type="datetime-local" style={inputStyle} {...register('deadline')} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    if (initialTask && window.confirm('Delete this task?')) {
                      deleteTask.mutate(initialTask.id, {
                        onSuccess: () => {
                          onClose();
                        },
                      });
                    }
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-error)',
                    background: 'transparent',
                    color: 'var(--color-error)',
                  }}
                >
                  Delete
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid transparent',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontWeight: 'var(--font-semibold)',
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending ? 'Saving...' : isEditing ? 'Save changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}