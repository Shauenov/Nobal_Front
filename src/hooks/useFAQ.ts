import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  ApiEnvelope,
  FAQCreate,
  FAQOut,
  FAQUpdate,
  ReorderRequest,
} from '@/types/api';

// ── List FAQs ─────────────────────────────────────────────────
export function useFAQs(params?: { category?: string; is_active?: boolean }) {
  return useQuery({
    queryKey: queryKeys.faqs,
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<FAQOut[]>>('/api/v1/faqs', { params });
      return res.data.data;
    },
  });
}

// ── Create FAQ ────────────────────────────────────────────────
export function useCreateFAQ() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: FAQCreate) => {
      const res = await apiClient.post<ApiEnvelope<FAQOut>>('/api/v1/faqs', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.faqs });
      toast.success('FAQ created');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Update FAQ ────────────────────────────────────────────────
export function useUpdateFAQ() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; data: FAQUpdate }) => {
      const res = await apiClient.put<ApiEnvelope<FAQOut>>(`/api/v1/faqs/${payload.id}`, payload.data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.faqs });
      toast.success('FAQ updated');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Delete FAQ ────────────────────────────────────────────────
export function useDeleteFAQ() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/faqs/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.faqs });
      toast.success('FAQ deleted');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Reorder FAQs ──────────────────────────────────────────────
export function useReorderFAQs() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReorderRequest) => {
      await apiClient.patch('/api/v1/faqs/reorder', data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.faqs });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}
