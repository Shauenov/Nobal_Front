import type { CSSProperties } from 'react';
import { AppointmentOut } from '@/types/api';

interface AppointmentCardProps {
  appointment: AppointmentOut;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-4)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  boxShadow: 'var(--shadow-sm)',
};

const badgeStyle = (color: string): CSSProperties => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  background: color,
  color: '#fff',
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'var(--color-warning)';
    case 'confirmed':
      return 'var(--color-primary)';
    case 'completed':
      return 'var(--color-success)';
    case 'cancelled':
      return 'var(--color-error)';
    default:
      return 'var(--color-text-secondary)';
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

export function AppointmentCard({ appointment, onComplete, onCancel }: AppointmentCardProps) {
  const createdAt = new Date(appointment.created_at);
  
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
            Student ID: {appointment.student_id} {/* STUB: resolve student name from cache */}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Created {createdAt.toLocaleString()}
            {appointment.slot_id ? ` · Slot ${appointment.slot_id}` : ''}
          </div>
        </div>
        <div style={badgeStyle(getStatusColor(appointment.status))}>
          {appointment.status.toUpperCase()}
        </div>
      </div>

      {appointment.notes && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
          <strong>Notes:</strong> {appointment.notes}
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', justifyContent: 'flex-end' }}>
        {appointment.status === 'confirmed' && onComplete && (
          <button style={buttonStyle('primary')} onClick={() => onComplete(appointment.id)}>
            Complete
          </button>
        )}
        {(appointment.status === 'pending' || appointment.status === 'confirmed') && onCancel && (
          <button style={buttonStyle('danger')} onClick={() => onCancel(appointment.id)}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
