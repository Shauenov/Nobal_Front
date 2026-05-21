'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { RoadmapOut, RoadmapCreate, RoadmapTemplateTaskCreate } from '@/types/api';
import { useUniversities } from '@/hooks/useUniversities';
import { TemplateTaskList } from './TemplateTaskList';

interface RoadmapFormProps {
  roadmap?: RoadmapOut;
  templateTasks?: RoadmapTemplateTaskCreate[];
  onSubmit: (data: RoadmapCreate) => Promise<void>;
  isLoading?: boolean;
}

const templateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().nullable(),
  order_index: z.number().min(0),
  days_offset: z.number().min(0).optional().nullable(),
});

const roadmapSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional().nullable(),
  target_type: z.string().optional().nullable(),
  is_public: z.boolean().optional(),
  university_id: z.string().optional().nullable(),
  template_tasks: z.array(templateTaskSchema).optional(),
});

type RoadmapFormData = z.infer<typeof roadmapSchema>;

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
};

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  color: 'var(--color-text-primary)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-primary)',
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: '80px',
  resize: 'vertical',
};

const errorStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-error)',
  marginTop: '4px',
};

const sectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
  padding: 'var(--space-4)',
  background: 'var(--color-surface-hover)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-primary)',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 'var(--space-4)',
};

const buttonGroupStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 'var(--space-3)',
  marginTop: 'var(--space-4)',
};

const buttonStyle = (variant: 'primary' | 'ghost' = 'primary', disabled?: boolean): CSSProperties => ({
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

const checkboxGroupStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
};

const taskInputStyle: CSSProperties = {
  ...inputStyle,
  fontSize: 'var(--text-sm)',
};

export function RoadmapForm({
  roadmap,
  templateTasks = [],
  onSubmit,
  isLoading = false,
}: RoadmapFormProps) {
  const [tasks, setTasks] = useState<RoadmapTemplateTaskCreate[]>(templateTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDaysOffset, setNewTaskDaysOffset] = useState('');

  const { data: universitiesResp } = useUniversities({ page: 1, page_size: 200 });
  const allUniversities = universitiesResp?.data ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RoadmapFormData>({
    resolver: zodResolver(roadmapSchema),
    mode: 'onChange',
    defaultValues: {
      title: roadmap?.title || '',
      description: roadmap?.description || '',
      target_type: roadmap?.target_type || '',
      is_public: roadmap?.is_public || false,
      university_id: roadmap?.university_id || null,
    },
  });

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: RoadmapTemplateTaskCreate = {
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      order_index: tasks.length,
      days_offset: newTaskDaysOffset ? parseInt(newTaskDaysOffset) : undefined,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDaysOffset('');
  };

  const handleFormSubmit = async (data: RoadmapFormData) => {
    try {
      await onSubmit({
        ...data,
        template_tasks: tasks,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={formStyle}>
      <div>
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Title <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input {...register('title')} type="text" placeholder="Название маршрута" style={inputStyle} />
          {errors.title && <div style={errorStyle}>{errors.title.message}</div>}
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Description</label>
        <textarea {...register('description')} placeholder="Описание маршрута" style={textareaStyle} />
      </div>

      <div style={gridStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Тип цели</label>
          <input {...register('target_type')} type="text" placeholder="напр. Бакалавр, Магистр" style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Целевой университет
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: 6, fontWeight: 400 }}>
              (назначение роудмапа = заявка в университет)
            </span>
          </label>
          <select {...register('university_id')} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">— Не привязан —</option>
            {allUniversities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}{u.city ? ` · ${u.city}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={checkboxGroupStyle}>
        <input type="checkbox" id="is_public" {...register('is_public')} style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
        <label htmlFor="is_public" style={{ ...labelStyle, margin: 0, cursor: 'pointer', fontWeight: 'normal' }}>
          Публичный
        </label>
      </div>

      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Шаблонные задачи</div>

        {tasks.length > 0 && (
          <TemplateTaskList
            tasks={tasks}
            onTasksChange={setTasks}
            isEditable
            isLoading={isLoading}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border)' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Добавить задачу</label>
            <input
              type="text"
              placeholder="Название задачи"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              style={taskInputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <input
              type="text"
              placeholder="Описание (необязательно)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              style={taskInputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <input
              type="number"
              placeholder="Смещение дней (напр. 30)"
              min="0"
              value={newTaskDaysOffset}
              onChange={(e) => setNewTaskDaysOffset(e.target.value)}
              style={taskInputStyle}
            />
          </div>

          <button
            type="button"
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim() || isLoading}
            style={buttonStyle('ghost', !newTaskTitle.trim() || isLoading)}
          >
            + Добавить задачу
          </button>
        </div>
      </div>

      <div style={buttonGroupStyle}>
        <button type="submit" style={buttonStyle('primary', !isValid || isLoading)} disabled={!isValid || isLoading}>
          {isLoading ? 'Сохранение...' : roadmap ? 'Обновить маршрут' : 'Создать маршрут'}
        </button>
      </div>
    </form>
  );
}
