'use client';

import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
import type { RoadmapCreate } from '@/types/api';
import { useCreateRoadmap } from '@/hooks/useRoadmaps';
import { PageHeader } from '@/components/layout/PageHeader';
import { RoadmapForm } from '@/components/roadmaps/RoadmapForm';
import { toast } from 'react-hot-toast';

const containerStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
};

export default function NewRoadmapPage() {
  const router = useRouter();
  const createRoadmap = useCreateRoadmap();

  const handleSubmit = async (data: RoadmapCreate) => {
    try {
      await createRoadmap.mutateAsync(data);
      toast.success('Маршрут создан');
      router.push('/roadmaps');
    } catch {
      toast.error('Не удалось создать маршрут');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <PageHeader title="Создать маршрут" subtitle="Добавьте новый шаблон маршрута." />

      <div style={containerStyle}>
        <RoadmapForm onSubmit={handleSubmit} isLoading={createRoadmap.isPending} />
      </div>
    </div>
  );
}
