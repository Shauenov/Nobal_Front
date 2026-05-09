import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  ApiEnvelope,
  CalendarEventCreate,
  CalendarEventOut,
  CalendarEventUpdate,
} from '@/types/api';

// ── List calendar events ──────────────────────────────────────
export function useCalendarEvents(params?: { from?: string; to?: string; event_type?: string }) {
  return useQuery({
    queryKey: queryKeys.calendar(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<CalendarEventOut[]>>('/api/v1/calendar', {
        params,
      });
      return res.data.data;
    },
  });
}

// ── Create calendar event ─────────────────────────────────────
export function useCreateCalendarEvent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: CalendarEventCreate) => {
      const res = await apiClient.post<ApiEnvelope<CalendarEventOut>>('/api/v1/calendar', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.calendar() });
      toast.success('Event created');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Update calendar event ─────────────────────────────────────
export function useUpdateCalendarEvent(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: CalendarEventUpdate) => {
      const res = await apiClient.put<ApiEnvelope<CalendarEventOut>>(
        `/api/v1/calendar/${id}`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.calendar() });
      toast.success('Event updated');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Delete calendar event ─────────────────────────────────────
export function useDeleteCalendarEvent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/calendar/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.calendar() });
      toast.success('Event deleted');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}
