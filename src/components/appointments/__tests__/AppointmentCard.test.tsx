import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AppointmentOut } from '@/types/api';
import { AppointmentCard } from '../AppointmentCard';

const appointment: AppointmentOut = {
  id: 'app-1',
  slot_id: 'slot-1',
  student_id: 'student-1',
  adviser_id: 'adviser-1',
  status: 'confirmed',
  consultation_type: 'video',
  notes: 'Bring passport copies',
  cancelled_at: null,
  cancel_reason: null,
  created_at: '2026-05-09T00:00:00.000Z',
  updated_at: '2026-05-09T00:00:00.000Z',
};

describe('AppointmentCard', () => {
  it('renders status and action buttons', () => {
    const onComplete = vi.fn();
    const onCancel = vi.fn();

    render(<AppointmentCard appointment={appointment} onComplete={onComplete} onCancel={onCancel} />);

    // studentName not passed → falls back to truncated ID display
    expect(screen.getByText(/Студент student-/)).toBeInTheDocument();
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    // consultation_type appears in the subtitle
    expect(screen.getByText(/video/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Завершить' }));
    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));

    expect(onComplete).toHaveBeenCalledWith('app-1');
    expect(onCancel).toHaveBeenCalledWith('app-1');
  });
});
