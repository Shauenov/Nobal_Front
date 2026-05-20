import type { CSSProperties } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { AppointmentOut } from '@/types/api';

interface AppointmentCardProps {
  appointment: AppointmentOut;
  studentName?: string;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const cardStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'info';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'neutral';
  }
};

const buttonStyle = (variant: 'primary' | 'danger'): CSSProperties => ({
  padding: '6px 12px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  cursor: 'pointer',
  border: 'none',
  background: variant === 'primary' ? 'var(--color-primary)' : 'var(--color-error)',
  color: '#fff',
});

export function AppointmentCard({ appointment, studentName, onComplete, onCancel }: AppointmentCardProps) {
  const createdAt = new Date(appointment.created_at);
  
  return (
    <Card padding="md" variant="default">
      <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
            {studentName ?? `Студент ${appointment.student_id.slice(0, 8)}…`}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Создано {createdAt.toLocaleString('ru-RU')}
            {appointment.consultation_type ? ` · ${appointment.consultation_type}` : ''}
          </div>
        </div>
        <Badge variant={getStatusVariant(appointment.status)}>{appointment.status.toUpperCase()}</Badge>
      </div>

      {appointment.notes && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
          <strong>Заметки:</strong> {appointment.notes}
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', justifyContent: 'flex-end' }}>
        {appointment.status === 'confirmed' && onComplete && (
          <button style={buttonStyle('primary')} onClick={() => onComplete(appointment.id)}>
            Завершить
          </button>
        )}
        {(appointment.status === 'pending' || appointment.status === 'confirmed') && onCancel && (
          <button style={buttonStyle('danger')} onClick={() => onCancel(appointment.id)}>
            Отменить
          </button>
        )}
      </div>
      </div>
    </Card>
  );
}
