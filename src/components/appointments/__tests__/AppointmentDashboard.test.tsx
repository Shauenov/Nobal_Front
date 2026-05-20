import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppointmentDashboard } from '../AppointmentDashboard';
import type { AppointmentOut } from '@/types/api';

vi.mock('@/hooks/useAppointments', () => ({
  useMyAppointments: () => ({ data: [], isLoading: false }),
  useAppointments: vi.fn(),
  useCompleteAppointment: () => ({ mutate: vi.fn() }),
  useCancelAppointment: () => ({ mutate: vi.fn() }),
}));

vi.mock('@/hooks/useStudents', () => ({
  useStudents: () => ({ data: { data: [], meta: { total: 0 } }, isLoading: false }),
}));

vi.mock('@/hooks/useReports', () => ({
  useOverviewReport: () => ({ data: null }),
}));

vi.mock('@/components/layout/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

import * as apptHooks from '@/hooks/useAppointments';
const mockUseAppointments = apptHooks.useAppointments as ReturnType<typeof vi.fn>;

const mockAppointments: AppointmentOut[] = [
  {
    id: 'app-1',
    slot_id: 'slot-1',
    student_id: 'student-1',
    conductor_id: 'conductor-1',
    status: 'confirmed',
    consultation_type: 'video',
    notes: null,
    cancelled_at: null,
    cancel_reason: null,
    created_at: '2026-05-09T10:00:00.000Z',
    updated_at: '2026-05-09T10:00:00.000Z',
  },
];

describe('AppointmentDashboard', () => {
  beforeEach(() => {
    vi.useRealTimers();
    mockUseAppointments.mockReturnValue({ data: mockAppointments, isLoading: false });
  });

  it('renders the page header', () => {
    render(<AppointmentDashboard />, { wrapper });

    expect(screen.getByText('Записи')).toBeInTheDocument();
  });

  it('renders metric cards', () => {
    render(<AppointmentDashboard />, { wrapper });

    expect(screen.getByText('Активные студенты')).toBeInTheDocument();
    expect(screen.getByText('Проведено встреч')).toBeInTheDocument();
    expect(screen.getByText('Средний балл')).toBeInTheDocument();
  });

  it('renders appointment as a session row with Russian status', () => {
    render(<AppointmentDashboard />, { wrapper });

    // Status badge in Russian — getAllByText because the filter dropdown also contains this text
    expect(screen.getAllByText('Подтверждено').length).toBeGreaterThan(0);
    // consultation_type mapped to Russian — appears in both the table and the side panel
    expect(screen.getAllByText('Онлайн').length).toBeGreaterThan(0);
  });

  it('shows empty state when no appointments', () => {
    mockUseAppointments.mockReturnValue({ data: [], isLoading: false });

    render(<AppointmentDashboard />, { wrapper });

    expect(screen.getByText('Нет предстоящих записей')).toBeInTheDocument();
  });

  it('shows "Ближайшие занятия" section header', () => {
    render(<AppointmentDashboard />, { wrapper });

    expect(screen.getByText('Ближайшие занятия')).toBeInTheDocument();
  });
});
