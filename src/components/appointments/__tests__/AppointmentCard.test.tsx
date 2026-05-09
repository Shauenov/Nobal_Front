import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AppointmentOut } from '@/types/api';
import { AppointmentCard } from '../AppointmentCard';

const appointment: AppointmentOut = {
  id: 'app-1',
  slot_id: 'slot-1',
  student_id: 'student-1',
  conductor_id: 'conductor-1',
  status: 'confirmed',
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

    expect(screen.getByText('Student ID: student-1')).toBeInTheDocument();
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    expect(screen.getByText(/Slot slot-1/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onComplete).toHaveBeenCalledWith('app-1');
    expect(onCancel).toHaveBeenCalledWith('app-1');
  });
});
