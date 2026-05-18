'use client';

import { useState, type CSSProperties } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { useStudentTasks, usePatchTaskStatus } from '@/hooks/useTasks';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { ViewToggle } from '@/components/tasks/ViewToggle';
import { TaskModal } from '@/components/tasks/TaskModal';
import { PageHeader } from '@/components/layout/PageHeader';
import type { TaskOut, TaskStatus } from '@/types/api';

// ── Styles ────────────────────────────────────────────────────

const pageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
};

const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  boxShadow: 'var(--shadow-sm)',
};

const selectStyle: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
  minWidth: 240,
  cursor: 'pointer',
};

const btnPrimary: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  background: 'var(--color-primary)',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 'var(--text-sm)',
};

// ── Component ─────────────────────────────────────────────────

export default function TasksPage() {
  const { data: studentsData } = useStudents({ page_size: 100 });
  const students = studentsData?.data ?? [];

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [view, setView] = useState<'list' | 'board'>('board');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskOut | null>(null);

  const tasks = useStudentTasks(selectedStudentId, { page: 1, page_size: 100 });
  const patchTask = usePatchTaskStatus(selectedStudentId);

  const items = tasks.data?.data ?? [];

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  function handleOpenCreate() {
    setSelectedTask(null);
    setTaskModalOpen(true);
  }

  function handleOpenEdit(task: TaskOut) {
    setSelectedTask(task);
    setTaskModalOpen(true);
  }

  function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    patchTask.mutate({ taskId, data: { status: newStatus } });
  }

  return (
    <div style={pageStyle}>
      <PageHeader
        title="Задания"
        subtitle="Управление заданиями по студентам"
        action={
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            {selectedStudentId && (
              <>
                <button style={btnPrimary} onClick={handleOpenCreate}>
                  + Создать задание
                </button>
                <ViewToggle view={view} onChange={setView} />
              </>
            )}
          </div>
        }
      />

      {/* Student selector */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <label
            htmlFor="student-select"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', flexShrink: 0 }}
          >
            Студент:
          </label>
          <select
            id="student-select"
            style={selectStyle}
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">— Выберите студента —</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
                {s.group_type ? ` · Гр. ${s.group_type}` : ''}
                {s.course_year ? `, ${s.course_year} курс` : ''}
              </option>
            ))}
          </select>

          {selectedStudentId && (
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {tasks.isLoading ? 'Загрузка...' : `${items.length} задан${items.length === 1 ? 'ие' : items.length < 5 ? 'ия' : 'ий'}`}
            </span>
          )}
        </div>
      </div>

      {/* Task board / list */}
      {!selectedStudentId ? (
        <div
          style={{
            ...cardStyle,
            textAlign: 'center',
            padding: 'var(--space-12)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>📋</div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Выберите студента</div>
          <div style={{ fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Выберите студента выше, чтобы просмотреть его задания
          </div>
        </div>
      ) : (
        <div style={cardStyle}>
          {tasks.isLoading ? (
            <div style={{ color: 'var(--color-text-secondary)', padding: 'var(--space-4)' }}>
              Загрузка заданий...
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>
              <div style={{ marginBottom: 'var(--space-3)' }}>У {selectedStudent?.full_name} нет заданий</div>
              <button style={btnPrimary} onClick={handleOpenCreate}>
                Создать первое задание
              </button>
            </div>
          ) : view === 'list' ? (
            <TaskList tasks={items} onTaskClick={handleOpenEdit} />
          ) : (
            <TaskBoard
              tasks={items}
              onTaskStatusChange={handleStatusChange}
              onTaskClick={handleOpenEdit}
            />
          )}
        </div>
      )}

      {selectedStudentId && (
        <TaskModal
          open={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          studentId={selectedStudentId}
          initialTask={selectedTask}
        />
      )}
    </div>
  );
}
