'use client';

import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useRoadmaps, useCreateRoadmap, useUpdateRoadmap, useDeleteRoadmap, useAssignRoadmap } from '@/hooks/useRoadmaps';
import { useStudents } from '@/hooks/useStudents';
import { RoadmapForm } from '@/components/roadmaps/RoadmapForm';
import type { RoadmapOut, RoadmapCreate, AssignRequest } from '@/types/api';

/* ─── Styles ─── */
const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: 'var(--space-4)',
};

const cardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e8ecf0',
  borderRadius: 14,
  padding: '18px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
};

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

const modalCard: CSSProperties = {
  background: '#fff',
  borderRadius: 14,
  width: '100%',
  maxWidth: 600,
  boxShadow: '0 12px 32px rgba(15,23,42,0.2)',
  padding: '24px 26px',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const btn = (variant: 'primary' | 'ghost' | 'danger'): CSSProperties => ({
  padding: '7px 12px',
  borderRadius: 7,
  border: variant === 'ghost' ? '1px solid #e2e8f0' : variant === 'danger' ? '1px solid #fecaca' : 'none',
  background: variant === 'primary' ? '#2563eb' : '#fff',
  color: variant === 'primary' ? '#fff' : variant === 'danger' ? '#dc2626' : '#475569',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

/* ─── Assign modal ─── */
function AssignModal({ roadmap, onClose }: { roadmap: RoadmapOut; onClose: () => void }) {
  const { data: studentsData } = useStudents({ page_size: 200 });
  const students = studentsData?.data ?? [];
  const [studentId, setStudentId] = useState('');
  const assign = useAssignRoadmap(roadmap.id);

  const handleAssign = async () => {
    if (!studentId) return;
    const payload: AssignRequest = { student_id: studentId };
    await assign.mutateAsync(payload);
    onClose();
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...modalCard, maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: 16 }}>
          Назначить студенту — {roadmap.title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Студент</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#1e293b' }}
          >
            <option value="">— Выберите студента —</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name}{s.group_type ? ` · ${s.group_type}` : ''}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button type="button" style={btn('ghost')} onClick={onClose}>Отмена</button>
          <button type="button" style={btn('primary')} disabled={!studentId || assign.isPending} onClick={handleAssign}>
            {assign.isPending ? 'Назначение…' : 'Назначить'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Create / Edit modal ─── */
function RoadmapModal({
  roadmap,
  onClose,
}: {
  roadmap?: RoadmapOut;
  onClose: () => void;
}) {
  const createRoadmap = useCreateRoadmap();
  const updateRoadmap = useUpdateRoadmap(roadmap?.id ?? '');

  const handleSubmit = async (data: RoadmapCreate) => {
    if (roadmap) {
      await updateRoadmap.mutateAsync(data);
    } else {
      await createRoadmap.mutateAsync(data);
    }
    onClose();
  };

  const isPending = createRoadmap.isPending || updateRoadmap.isPending;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: 20 }}>
          {roadmap ? 'Редактировать маршрут' : 'Создать маршрут'}
        </div>
        <RoadmapForm roadmap={roadmap} onSubmit={handleSubmit} isLoading={isPending} />
        <button type="button" style={{ ...btn('ghost'), marginTop: 12 }} onClick={onClose}>Отмена</button>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function RoadmapsPage() {
  const { data: response, isLoading } = useRoadmaps({ page: 1, page_size: 20 });
  const deleteRoadmap = useDeleteRoadmap();

  const roadmaps = useMemo(() => response?.data ?? [], [response?.data]);

  const [showCreate, setShowCreate] = useState(false);
  const [editRoadmap, setEditRoadmap] = useState<RoadmapOut | null>(null);
  const [assignRoadmap, setAssignRoadmap] = useState<RoadmapOut | null>(null);

  const handleDelete = (roadmap: RoadmapOut) => {
    if (window.confirm(`Удалить маршрут «${roadmap.title}»?`)) {
      deleteRoadmap.mutate(roadmap.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <PageHeader
        title="Маршруты"
        subtitle="Создавайте и управляйте шаблонами маршрутов"
        action={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8, border: 'none',
              background: '#2563eb', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={15} />
            Создать маршрут
          </button>
        }
      />

      {showCreate && <RoadmapModal onClose={() => setShowCreate(false)} />}
      {editRoadmap && <RoadmapModal roadmap={editRoadmap} onClose={() => setEditRoadmap(null)} />}
      {assignRoadmap && <AssignModal roadmap={assignRoadmap} onClose={() => setAssignRoadmap(null)} />}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Загрузка...</div>
      ) : roadmaps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>Нет маршрутов</div>
          <div style={{ fontSize: '0.85rem' }}>Создайте первую маршрут, нажав кнопку выше</div>
        </div>
      ) : (
        <div style={gridStyle}>
          {roadmaps.map((roadmap) => (
            <div key={roadmap.id} style={cardStyle}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', marginBottom: 4 }}>
                  {roadmap.title}
                </div>
                {roadmap.description && (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                    {roadmap.description}
                  </div>
                )}
              </div>
              {roadmap.target_type && (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Тип: {roadmap.target_type}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button type="button" style={btn('ghost')} onClick={() => setEditRoadmap(roadmap)}>
                  <Pencil size={12} /> Изменить
                </button>
                <button type="button" style={btn('ghost')} onClick={() => setAssignRoadmap(roadmap)}>
                  <Users size={12} /> Назначить
                </button>
                <button
                  type="button"
                  style={btn('danger')}
                  onClick={() => handleDelete(roadmap)}
                  disabled={deleteRoadmap.isPending}
                >
                  <Trash2 size={12} /> Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
