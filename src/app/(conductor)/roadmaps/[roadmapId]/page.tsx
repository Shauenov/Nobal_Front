'use client';

import { useRouter, useParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import { Suspense } from 'react';
import { useRoadmap, useUpdateRoadmap, useAssignRoadmap } from '@/hooks/useRoadmaps';
import { PageHeader } from '@/components/layout/PageHeader';
import { RoadmapForm } from '@/components/roadmaps/RoadmapForm';
import { RoadmapAssignModal } from '@/components/roadmaps/RoadmapAssignModal';
import type { AssignRequest, RoadmapUpdate } from '@/types/api';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

const containerStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
};

const tabsStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-2)',
  borderBottom: '1px solid var(--color-border)',
  marginBottom: 'var(--space-4)',
};

const tabStyle = (active: boolean): CSSProperties => ({
  padding: '12px 16px',
  borderBottom: active ? '2px solid var(--color-primary)' : 'none',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  fontSize: 'var(--text-sm)',
  fontWeight: active ? 'var(--font-semibold)' : 'var(--font-medium)',
  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
});

const loadingStyle: CSSProperties = {
  padding: 'var(--space-6)',
  textAlign: 'center',
  color: 'var(--color-text-secondary)',
};

function RoadmapDetailContent() {
  const router = useRouter();
  const params = useParams();
  const roadmapId = params.roadmapId as string;
  const { data: detail, isLoading } = useRoadmap(roadmapId);
  const updateRoadmap = useUpdateRoadmap(roadmapId);
  const assignRoadmap = useAssignRoadmap(roadmapId);
  const [activeTab, setActiveTab] = useState<'overview' | 'assign'>('overview');
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  if (isLoading) {
    return <div style={loadingStyle}>Загрузка маршрута...</div>;
  }

  if (!detail) {
    return <div style={loadingStyle}>Маршрут не найден</div>;
  }

  const { roadmap, template_tasks } = detail;

  const handleUpdateRoadmap = async (data: RoadmapUpdate) => {
    try {
      await updateRoadmap.mutateAsync(data);
      toast.success('Маршрут обновлён');
      router.push('/roadmaps');
    } catch {
      toast.error('Не удалось обновить маршрут');
    }
  };

  const handleAssignRoadmap = async (data: AssignRequest) => {
    try {
      await assignRoadmap.mutateAsync(data);
      setAssignModalOpen(false);
    } catch {
      toast.error('Не удалось назначить маршрут');
    }
  };

  return (
    <>
      <div style={tabsStyle}>
        <button
          style={tabStyle(activeTab === 'overview')}
          onClick={() => setActiveTab('overview')}
        >
          Обзор
        </button>
        <button
          style={tabStyle(activeTab === 'assign')}
          onClick={() => setActiveTab('assign')}
        >
          Назначить
        </button>
      </div>

      {activeTab === 'overview' && (
        <div style={containerStyle}>
          <RoadmapForm
            roadmap={roadmap}
            templateTasks={template_tasks}
            onSubmit={handleUpdateRoadmap}
            isLoading={updateRoadmap.isPending}
          />
        </div>
      )}

      {activeTab === 'assign' && (
        <div style={containerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>
              Назначить маршрут
            </h3>
            <button
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                border: 'none',
                background: 'var(--color-primary)',
                color: '#fff',
              }}
              onClick={() => setAssignModalOpen(true)}
            >
              + Назначить студенту
            </button>
          </div>
          <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-4)' }}>
            Студентов пока нет
          </div>
        </div>
      )}

      <RoadmapAssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        templateTasks={template_tasks}
        onSubmit={handleAssignRoadmap}
        isLoading={assignRoadmap.isPending}
      />
    </>
  );
}

export default function RoadmapDetailPage() {
  return (
    <Suspense fallback={<div style={loadingStyle}>Загрузка...</div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <PageHeader title="Редактировать маршрут" subtitle="Обновите детали маршрута и управляйте назначениями." />
        <RoadmapDetailContent />
      </div>
    </Suspense>
  );
}
