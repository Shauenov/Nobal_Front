'use client';

import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
import { useCreateUniversity } from '@/hooks/useUniversities';
import { PageHeader } from '@/components/layout/PageHeader';
import { UniversityForm } from '@/components/universities/UniversityForm';
import type { UniversityCreate } from '@/types/api';

const containerStyle: CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  padding: 'var(--space-6)',
};

export default function NewUniversityPage() {
  const router = useRouter();
  const createUniversity = useCreateUniversity();

  const handleSubmit = async (data: UniversityCreate) => {
    try {
      await createUniversity.mutateAsync(data);
      router.push('/universities');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <PageHeader
        title="Добавить университет"
        subtitle="Создайте новую запись университета в базе данных."
      />

      <div style={containerStyle}>
        <UniversityForm onSubmit={handleSubmit} isLoading={createUniversity.isPending} />
      </div>
    </div>
  );
}
