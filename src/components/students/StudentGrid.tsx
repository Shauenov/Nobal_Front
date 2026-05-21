'use client';

import type { CSSProperties } from 'react';
import type { StudentListItem } from '@/types/api';
import { StudentCard } from './StudentCard';

interface StudentGridProps {
  students: StudentListItem[];
  onDelete: (id: string) => void;
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 'var(--space-4)',
};

export function StudentGrid({ students, onDelete }: StudentGridProps) {
  return (
    <div style={gridStyle}>
      {students.map((student) => (
        <StudentCard key={student.id} student={student} onDelete={onDelete} />
      ))}
    </div>
  );
}
