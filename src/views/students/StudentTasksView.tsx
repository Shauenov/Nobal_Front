'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import { useStudentTasks, usePatchTaskStatus } from '@/hooks/useTasks';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { ViewToggle } from '@/components/tasks/ViewToggle';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskModal } from '@/components/tasks/TaskModal';
import type { TaskOut, TaskStatus } from '@/types/api';

const getStudentId = (value: string | string[] | undefined) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? '';
  return '';
};

export default function StudentTasksPage() {
  const params = useParams();
  const studentId = getStudentId(params.studentId);
  const tasks = useStudentTasks(studentId, { page: 1, page_size: 100 }); // Increase page size for board view
  const patchTask = usePatchTaskStatus(studentId);

  const [view, setView] = useState<'list' | 'board'>('board');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskOut | null>(null);
  const items = tasks.data?.data ?? [];

  const handleOpenCreate = () => {
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  const handleOpenEdit = (task: TaskOut) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    patchTask.mutate({ taskId, data: { status: newStatus } });
  };

  const pageCardStyle: CSSProperties = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    boxShadow: 'var(--shadow-sm)',
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <PageHeader
        title="Задачи"
        subtitle="Создавайте и отслеживайте задачи студента."
        action={
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleOpenCreate}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid transparent',
                background: 'var(--color-primary)',
                color: '#fff',
                fontWeight: 'var(--font-semibold)',
              }}
            >
              Новая задача
            </button>
            <ViewToggle view={view} onChange={setView} />
          </div>
        }
      />

      <div style={pageCardStyle}>
        {tasks.isLoading ? (
          <div style={{ color: 'var(--color-text-secondary)', padding: 'var(--space-4)' }}>
            Загрузка задач...
          </div>
        ) : view === 'list' ? (
          <TaskList tasks={items} onTaskClick={handleOpenEdit} />
        ) : (
          <TaskBoard tasks={items} onTaskStatusChange={handleStatusChange} onTaskClick={handleOpenEdit} />
        )}
      </div>

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        studentId={studentId}
        initialTask={selectedTask}
      />
    </div>
  );
}
