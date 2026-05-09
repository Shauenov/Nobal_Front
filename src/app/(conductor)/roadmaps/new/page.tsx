'use client';

import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
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

  const handleSubmit = async (data: unknown) => {
    try {
      await createRoadmap.mutateAsync(data);
      toast.success('Roadmap created successfully');
      router.push('/roadmaps');
    } catch {
      toast.error('Failed to create roadmap');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <PageHeader title="Create Roadmap" subtitle="Add a new roadmap template." />

      <div style={containerStyle}>
        <RoadmapForm onSubmit={handleSubmit} isLoading={createRoadmap.isPending} />
      </div>
    </div>
  );
}
