'use client';

import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateTask, useDeleteTask, useTaskHistory, useUpdateTask } from '@/hooks/useTasks';
import type { TaskHistoryItem, TaskOut, TaskPriority } from '@/types/api';

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
  maxWidth: 900,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: 'var(--shadow-lg)',
  display: 'flex',
  overflow: 'hidden',
  maxHeight: '90vh',
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

const EVENT_LABELS: Record<string, string> = {
  created: 'Задание создано',
  status_changed: 'Статус изменён',
  updated: 'Задание обновлено',
  deleted: 'Задание удалено',
};

const EVENT_ICONS: Record<string, string> = {
  created: '✦',
  status_changed: '⇄',
  updated: '✎',
  deleted: '✕',
};

const EVENT_COLORS: Record<string, string> = {
  created: '#16a34a',
  status_changed: '#2563eb',
  updated: '#ca8a04',
  deleted: '#dc2626',
};

function formatHistoryDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function HistoryPanel({ taskId }: { taskId: string }) {
  const { data: history, isLoading } = useTaskHistory(taskId);

  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        borderLeft: '1px solid var(--color-border)',
        background: 'var(--color-bg, #f9fafb)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
        }}
      >
        История
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-3) var(--space-4)' }}>
        {isLoading ? (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            Загрузка...
          </p>
        ) : !history || history.length === 0 ? (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            История пуста
          </p>
        ) : (
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[...history].reverse().map((entry: TaskHistoryItem) => (
              <li key={entry.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                {/* Icon dot */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: EVENT_COLORS[entry.event_type] ?? '#6b7280',
                    color: '#fff',
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {EVENT_ICONS[entry.event_type] ?? '•'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {EVENT_LABELS[entry.event_type] ?? entry.event_type}
                  </div>

                  {entry.event_type === 'status_changed' && entry.old_value && entry.new_value && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {entry.old_value} → {entry.new_value}
                    </div>
                  )}
                  {entry.event_type === 'updated' && entry.new_value && (
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-secondary)',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {entry.new_value}
                    </div>
                  )}
                  {entry.event_type === 'created' && entry.new_value && (
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-secondary)',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      «{entry.new_value}»
                    </div>
                  )}

                  <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                    {formatHistoryDate(entry.created_at)}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

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
      reset({ title: '', description: '', priority: 'medium', deadline: '' });
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
      await updateTask.mutateAsync({ taskId: initialTask.id, data: payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    onClose();
  });

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        {/* ── Form panel ── */}
        <div style={{ flex: 1, padding: 'var(--space-6)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>
              {isEditing ? 'Редактировать задание' : 'Создать задание'}
            </h2>
            <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              {isEditing ? 'Обновите детали и дедлайн задания.' : 'Создайте новое задание для студента.'}
            </p>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={labelStyle} htmlFor="task-title">Название</label>
                <input id="task-title" style={inputStyle} {...register('title')} />
                {errors.title && <span style={errorStyle}>{errors.title.message}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={labelStyle} htmlFor="task-priority">Приоритет</label>
                <select id="task-priority" style={inputStyle} {...register('priority')}>
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={labelStyle} htmlFor="task-description">Описание</label>
              <textarea id="task-description" rows={4} style={inputStyle} {...register('description')} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={labelStyle} htmlFor="task-deadline">Дедлайн</label>
              <input id="task-deadline" type="datetime-local" style={inputStyle} {...register('deadline')} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
              <div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      if (initialTask && window.confirm('Удалить задание?')) {
                        deleteTask.mutate(initialTask.id, { onSuccess: onClose });
                      }
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-error)',
                      background: 'transparent',
                      color: 'var(--color-error)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    Удалить
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
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    fontWeight: 600,
                    opacity: isPending ? 0.7 : 1,
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {isPending ? 'Сохранение...' : isEditing ? 'Сохранить изменения' : 'Создать задание'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ── History panel (only when editing) ── */}
        {isEditing && initialTask && <HistoryPanel taskId={initialTask.id} />}
      </div>
    </div>
  );
}
