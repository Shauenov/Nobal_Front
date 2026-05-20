import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  AlumniCreate,
  AlumniOut,
  AlumniUpdate,
  ApiEnvelope,
  PaginatedEnvelope,
} from '@/types/api';

// ── List alumni ───────────────────────────────────────────────
export function useAlumni(params?: {
  is_published?: boolean;
  university_id?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: queryKeys.alumni,
    queryFn: async () => {
      const res = await apiClient.get<PaginatedEnvelope<AlumniOut>>('/api/v1/alumni', {
        params,
      });
      return res.data;
    },
  });
}

// ── Get alumni story ──────────────────────────────────────────
export function useAlumniItem(id: string) {
  return useQuery({
    queryKey: queryKeys.alumniItem(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<AlumniOut>>(`/api/v1/alumni/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

// ── Create alumni story ───────────────────────────────────────
export function useCreateAlumni() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: AlumniCreate) => {
      const res = await apiClient.post<ApiEnvelope<AlumniOut>>('/api/v1/alumni', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.alumni });
      toast.success('История выпускника создана');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Update alumni story ───────────────────────────────────────
export function useUpdateAlumni(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: AlumniUpdate) => {
      const res = await apiClient.put<ApiEnvelope<AlumniOut>>(`/api/v1/alumni/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.alumni });
      qc.invalidateQueries({ queryKey: queryKeys.alumniItem(id) });
      toast.success('История выпускника обновлена');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Delete alumni story ───────────────────────────────────────
export function useDeleteAlumni() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/alumni/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.alumni });
      toast.success('История выпускника удалена');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Upload Alumni Photo ───────────────────────────────────────
export function useUploadAlumniPhoto(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post<ApiEnvelope<AlumniOut>>(
        `/api/v1/alumni/${id}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.alumniItem(id) });
      qc.invalidateQueries({ queryKey: queryKeys.alumni });
      toast.success('Фото выпускника загружено');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}
