import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  ApiEnvelope,
  AppointmentOut,
  BookRequest,
  CancelRequest,
  SlotCreate,
  SlotOut,
  SlotsBatchCreate,
} from '@/types/api';

// ── List my appointments ──────────────────────────────────────
export function useMyAppointments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.myAppointments,
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<AppointmentOut[]>>('/api/v1/appointments/my', {
        headers: { 'x-skip-unauthorized-redirect': '1' },
      });
      return res.data.data;
    },
    enabled,
  });
}

// ── List all appointments ─────────────────────────────────────
export function useAppointments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.appointments,
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<AppointmentOut[]>>('/api/v1/appointments');
      return res.data.data;
    },
    enabled,
  });
}

// ── List slots ────────────────────────────────────────────────
export function useSlots(params?: { conductor_id?: string; from_time?: string }) {
  return useQuery({
    queryKey: queryKeys.slots(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<SlotOut[]>>('/api/v1/appointments/slots', {
        params,
      });
      return res.data.data;
    },
  });
}

// ── Create slot (single or batch) ────────────────────────────
export function useCreateSlot() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: SlotCreate | SlotsBatchCreate) => {
      const res = await apiClient.post<ApiEnvelope<SlotOut[]>>(
        '/api/v1/appointments/slots',
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.slots() });
      toast.success('Slot(s) created');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Delete slot ───────────────────────────────────────────────
export function useDeleteSlot() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (slotId: string) => {
      await apiClient.delete(`/api/v1/appointments/slots/${slotId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.slots() });
      toast.success('Slot deleted');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Book appointment ──────────────────────────────────────────
export function useBookAppointment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookRequest) => {
      const res = await apiClient.post<ApiEnvelope<AppointmentOut>>(
        '/api/v1/appointments',
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments });
      qc.invalidateQueries({ queryKey: queryKeys.slots() });
      toast.success('Appointment booked');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Cancel appointment ────────────────────────────────────────
export function useCancelAppointment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: CancelRequest }) => {
      await apiClient.patch(`/api/v1/appointments/${id}/cancel`, data ?? {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments });
      qc.invalidateQueries({ queryKey: queryKeys.myAppointments });
      toast.success('Appointment cancelled');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Complete appointment ──────────────────────────────────────
export function useCompleteAppointment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/api/v1/appointments/${id}/complete`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments });
      qc.invalidateQueries({ queryKey: queryKeys.myAppointments });
      toast.success('Appointment completed');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}
