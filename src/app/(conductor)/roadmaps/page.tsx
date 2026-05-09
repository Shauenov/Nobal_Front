import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useRoadmaps, useDeleteRoadmap } from '@/hooks/useRoadmaps';
import { PageHeader } from '@/components/layout/PageHeader';
import { RoadmapCard } from '@/components/roadmaps/RoadmapCard';

const headerActionsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 'var(--space-4)',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: 'var(--space-4)',
};

const buttonStyle: CSSProperties = {
  padding: '10px 16px',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  cursor: 'pointer',
  border: 'none',
  background: 'var(--color-primary)',
  color: '#fff',
};

const emptyStateStyle: CSSProperties = {
  textAlign: 'center',
  padding: 'var(--space-8)',
  color: 'var(--color-text-secondary)',
};

export default function RoadmapsPage() {
  const { data: response, isLoading } = useRoadmaps({ page: 1, page_size: 20 });
  const deleteRoadmap = useDeleteRoadmap();

  const roadmaps = useMemo(() => response?.data ?? [], [response?.data]);

  const handleDeleteRoadmap = (roadmapId: string) => {
    if (confirm('Are you sure you want to delete this roadmap?')) {
      deleteRoadmap.mutate(roadmapId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <PageHeader title="Roadmaps" subtitle="Create and manage roadmap templates." />

      <div style={headerActionsStyle}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          {roadmaps.length} roadmap{roadmaps.length !== 1 ? 's' : ''}
        </div>
        <Link href="/roadmaps/new" style={{ textDecoration: 'none' }}>
          <button style={buttonStyle}>+ New Roadmap</button>
        </Link>
      </div>

      {isLoading ? (
        <div style={emptyStateStyle}>Loading roadmaps...</div>
      ) : roadmaps.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
            No roadmaps yet
          </div>
          <div>Create a new roadmap to get started.</div>
        </div>
      ) : (
        <div style={gridStyle}>
          {roadmaps.map((roadmap) => (
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              onDelete={() => handleDeleteRoadmap(roadmap.id)}
              isLoading={deleteRoadmap.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
