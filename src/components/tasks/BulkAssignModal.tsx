'use client';

import { useState, type CSSProperties } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { TaskCreate, TaskPriority, TaskType, StudentListParams } from '@/types/api';

/* ─── Styles ─── */
const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,0.45)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  overflowY: 'auto',
};

const modal: CSSProperties = {
  background: '#fff',
  borderRadius: 14,
  width: '100%',
  maxWidth: 560,
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 12px 32px rgba(15,23,42,0.2)',
  padding: '24px 26px',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const sectionTitle: CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 8,
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  fontSize: '0.875rem',
  color: '#1e293b',
  background: '#fff',
};

const chip = (active: boolean, color = '#2563eb'): CSSProperties => ({
  padding: '5px 14px',
  borderRadius: 20,
  border: `1px solid ${active ? color : '#e2e8f0'}`,
  background: active ? color : '#fff',
  color: active ? '#fff' : '#475569',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
});

const labelStyle: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#475569',
  marginBottom: 4,
  display: 'block',
};

const btn = (variant: 'primary' | 'ghost', disabled?: boolean): CSSProperties => ({
  padding: '9px 18px',
  borderRadius: 8,
  border: variant === 'ghost' ? '1px solid #e2e8f0' : 'none',
  background: disabled ? '#93c5fd' : variant === 'primary' ? '#2563eb' : '#fff',
  color: variant === 'primary' ? '#fff' : '#475569',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
});

/* ─── Step indicator ─── */
function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Фильтр студентов', 'Задание', 'Подтверждение'];
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 4 }}>
      {steps.map((label, i) => {
        const num = (i + 1) as 1 | 2 | 3;
        const done = num < current;
        const active = num === current;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: done ? '#16a34a' : active ? '#2563eb' : '#e2e8f0',
                color: done || active ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700,
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{ fontSize: '0.68rem', color: active ? '#2563eb' : '#94a3b8', marginTop: 3, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? '#16a34a' : '#e2e8f0', marginBottom: 18 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main component ─── */
interface BulkAssignModalProps {
  onClose: () => void;
}

export function BulkAssignModal({ onClose }: BulkAssignModalProps) {
  const qc = useQueryClient();

  // Step 1 — filters
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [groupType, setGroupType] = useState<'D' | 'D1' | 'D2' | 'F' | 'F1' | 'F2' | 'F3' | 'F4' | ''>('');
  const [courseYear, setCourseYear] = useState<2 | 3 | ''>('');
  const [ielts, setIelts] = useState<'any' | 'yes' | 'no'>('any');
  const [sat, setSat] = useState<'any' | 'yes' | 'no'>('any');

  // Step 2 — task fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [taskType, setTaskType] = useState<TaskType>('assignment');

  // Step 3 — progress
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const filterParams: StudentListParams = {
    page_size: 500,
    ...(groupType ? { group_type: groupType } : {}),
    ...(courseYear ? { course_year: courseYear } : {}),
    ...(ielts !== 'any' ? { ielts_passed: ielts === 'yes' } : {}),
    ...(sat !== 'any' ? { sat_passed: sat === 'yes' } : {}),
  };

  const { data: studentsData, isLoading: studentsLoading } = useStudents(filterParams);
  const students = studentsData?.data ?? [];

  const handleBulkCreate = async () => {
    if (!title.trim() || students.length === 0) return;
    setIsSubmitting(true);
    setProgress(0);

    const taskPayload: TaskCreate = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      task_type: taskType,
      deadline: deadline || null,
    };

    let created = 0;
    const errors: string[] = [];

    for (const student of students) {
      try {
        await apiClient.post(`/api/v1/students/${student.id}/tasks`, taskPayload);
        created++;
      } catch {
        errors.push(student.full_name);
      }
      setProgress(Math.round(((created + errors.length) / students.length) * 100));
    }

    qc.invalidateQueries({ queryKey: queryKeys.reportsOverview });
    if (errors.length === 0) {
      toast.success(`Назначено ${created} студентам`);
    } else {
      toast.success(`Назначено ${created} студентам, ошибок: ${errors.length}`);
    }
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: 16 }}>
            Массовое назначение задания
          </div>
          <Steps current={step} />
        </div>

        {/* Step 1: Filters */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={sectionTitle}>Группа</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(['', 'D', 'D1', 'D2', 'F', 'F1', 'F2', 'F3', 'F4'] as const).map((g) => (
                  <button key={g || 'all'} type="button" style={chip(groupType === g)}
                    onClick={() => setGroupType(g)}>
                    {g === '' ? 'Все' : g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={sectionTitle}>Курс</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['', 2, 3] as const).map((y) => (
                  <button key={String(y)} type="button" style={chip(courseYear === y)}
                    onClick={() => setCourseYear(y)}>
                    {y === '' ? 'Любой' : `${y}-й курс`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={sectionTitle}>IELTS</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['any', 'yes', 'no'] as const).map((v) => (
                  <button key={v} type="button" style={chip(ielts === v, '#7c3aed')}
                    onClick={() => setIelts(v)}>
                    {v === 'any' ? 'Любой' : v === 'yes' ? 'Сдал' : 'Не сдал'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={sectionTitle}>SAT</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['any', 'yes', 'no'] as const).map((v) => (
                  <button key={v} type="button" style={chip(sat === v, '#7c3aed')}
                    onClick={() => setSat(v)}>
                    {v === 'any' ? 'Любой' : v === 'yes' ? 'Сдал' : 'Не сдал'}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview count */}
            <div style={{
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: '0.875rem',
              color: '#1e293b',
            }}>
              {studentsLoading ? 'Поиск...' : (
                <>Найдено <strong>{students.length}</strong> студент{students.length === 1 ? '' : students.length < 5 ? 'а' : 'ов'}</>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" style={btn('ghost')} onClick={onClose}>Отмена</button>
              <button
                type="button"
                style={btn('primary', students.length === 0 || studentsLoading)}
                disabled={students.length === 0 || studentsLoading}
                onClick={() => setStep(2)}
              >
                Далее →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Task form */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Название *</label>
              <input
                style={inputStyle}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название задания"
              />
            </div>

            <div>
              <label style={labelStyle}>Описание</label>
              <textarea
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание (необязательно)"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Дедлайн</label>
                <input type="date" style={inputStyle} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Тип</label>
                <select style={inputStyle} value={taskType} onChange={(e) => setTaskType(e.target.value as TaskType)}>
                  <option value="assignment">Задание</option>
                  <option value="deadline">Дедлайн</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Приоритет</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['low', 'medium', 'high'] as const).map((p) => {
                  const colors: Record<TaskPriority, string> = { low: '#16a34a', medium: '#d97706', high: '#dc2626' };
                  const labels: Record<TaskPriority, string> = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
                  return (
                    <button key={p} type="button" style={chip(priority === p, colors[p])}
                      onClick={() => setPriority(p)}>
                      {labels[p]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 4 }}>
              <button type="button" style={btn('ghost')} onClick={() => setStep(1)}>← Назад</button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" style={btn('ghost')} onClick={onClose}>Отмена</button>
                <button
                  type="button"
                  style={btn('primary', !title.trim())}
                  disabled={!title.trim()}
                  onClick={() => setStep(3)}
                >
                  Далее →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm + progress */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              padding: '14px 16px',
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: '0.875rem',
              color: '#1e293b',
            }}>
              <div><strong>Задание:</strong> {title}</div>
              {description && <div><strong>Описание:</strong> {description}</div>}
              {deadline && <div><strong>Дедлайн:</strong> {new Date(deadline).toLocaleDateString('ru-RU')}</div>}
              <div><strong>Приоритет:</strong> {priority === 'low' ? 'Низкий' : priority === 'medium' ? 'Средний' : 'Высокий'}</div>
              <div style={{ marginTop: 4, paddingTop: 8, borderTop: '1px solid #e2e8f0', fontWeight: 600, color: '#2563eb' }}>
                Будет назначено {students.length} студентам
              </div>
            </div>

            {isSubmitting && (
              <div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: 6 }}>
                  Создание заданий… {progress}%
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: '#2563eb', borderRadius: 4, transition: 'width 0.2s ease' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <button type="button" style={btn('ghost')} onClick={() => setStep(2)} disabled={isSubmitting}>← Назад</button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" style={btn('ghost')} onClick={onClose} disabled={isSubmitting}>Отмена</button>
                <button
                  type="button"
                  style={btn('primary', isSubmitting)}
                  disabled={isSubmitting}
                  onClick={handleBulkCreate}
                >
                  {isSubmitting ? `Создание… ${progress}%` : `Назначить ${students.length} студентам`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
