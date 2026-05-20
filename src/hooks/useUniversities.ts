import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  ApiEnvelope,
  PaginatedEnvelope,
  UniversityCreate,
  UniversityDetail,
  UniversityListParams,
  UniversityOut,
  UniversityProgramCreate,
  UniversityProgramOut,
  UniversityProgramUpdate,
  UniversityUpdate,
} from '@/types/api';

// ── List universities ─────────────────────────────────────────
export function useUniversities(params: UniversityListParams = {}) {
  return useQuery({
    queryKey: queryKeys.universities(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await apiClient.get<PaginatedEnvelope<UniversityOut>>('/api/v1/universities', {
        params,
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Get university ────────────────────────────────────────────
export function useUniversity(id: string) {
  return useQuery({
    queryKey: queryKeys.university(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<UniversityDetail>>(
        `/api/v1/universities/${id}`
      );
      return res.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Create university ─────────────────────────────────────────
export function useCreateUniversity() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: UniversityCreate) => {
      const res = await apiClient.post<ApiEnvelope<UniversityOut>>('/api/v1/universities', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.universities() });
      toast.success('Университет создан');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Update university ─────────────────────────────────────────
export function useUpdateUniversity(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: UniversityUpdate) => {
      const res = await apiClient.put<ApiEnvelope<UniversityOut>>(`/api/v1/universities/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.university(id) });
      qc.invalidateQueries({ queryKey: queryKeys.universities() });
      toast.success('Университет обновлён');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Delete university ─────────────────────────────────────────
export function useDeleteUniversity() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/universities/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.universities() });
      toast.success('Университет удалён');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Create program ────────────────────────────────────────────
export function useCreateProgram(universityId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: UniversityProgramCreate) => {
      const res = await apiClient.post<ApiEnvelope<UniversityProgramOut>>(
        `/api/v1/universities/${universityId}/programs`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.university(universityId) });
      toast.success('Программа добавлена');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Update program ────────────────────────────────────────────
export function useUpdateProgram(universityId: string, programId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: UniversityProgramUpdate) => {
      const res = await apiClient.put<ApiEnvelope<UniversityProgramOut>>(
        `/api/v1/universities/${universityId}/programs/${programId}`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.university(universityId) });
      toast.success('Программа обновлена');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Delete program ────────────────────────────────────────────
export function useDeleteProgram(universityId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (programId: string) => {
      await apiClient.delete(`/api/v1/universities/${universityId}/programs/${programId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.university(universityId) });
      toast.success('Программа удалена');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Upload Logo ───────────────────────────────────────────────
export function useUploadLogo(universityId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post<ApiEnvelope<UniversityOut>>(
        `/api/v1/universities/${universityId}/logo`,
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
      qc.invalidateQueries({ queryKey: queryKeys.university(universityId) });
      qc.invalidateQueries({ queryKey: queryKeys.universities() });
      toast.success('Логотип загружен');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Upload Cover ──────────────────────────────────────────────
export function useUploadCover(universityId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post<ApiEnvelope<UniversityOut>>(
        `/api/v1/universities/${universityId}/cover`,
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
      qc.invalidateQueries({ queryKey: queryKeys.university(universityId) });
      qc.invalidateQueries({ queryKey: queryKeys.universities() });
      toast.success('Обложка загружена');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}
