import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  ApiEnvelope,
  AssignRequest,
  PaginatedRoadmaps,
  RoadmapCreate,
  RoadmapDetail,
  RoadmapOut,
  RoadmapUpdate,
  StudentRoadmapOut,
} from '@/types/api';

// ── List roadmaps ─────────────────────────────────────────────
export function useRoadmaps(params: { page?: number; page_size?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.roadmaps(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await apiClient.get<PaginatedRoadmaps>('/api/v1/roadmaps', { params });
      return res.data;
    },
  });
}

// ── Get roadmap ───────────────────────────────────────────────
export function useRoadmap(id: string) {
  return useQuery({
    queryKey: queryKeys.roadmap(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<RoadmapDetail>>(`/api/v1/roadmaps/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

// ── Create roadmap ────────────────────────────────────────────
export function useCreateRoadmap() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: RoadmapCreate) => {
      const res = await apiClient.post<ApiEnvelope<RoadmapOut>>('/api/v1/roadmaps', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.roadmaps() });
      toast.success('Roadmap created');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Update roadmap ────────────────────────────────────────────
export function useUpdateRoadmap(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: RoadmapUpdate) => {
      const res = await apiClient.put<ApiEnvelope<RoadmapOut>>(`/api/v1/roadmaps/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.roadmap(id) });
      qc.invalidateQueries({ queryKey: queryKeys.roadmaps() });
      toast.success('Roadmap updated');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Delete roadmap ────────────────────────────────────────────
export function useDeleteRoadmap() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/roadmaps/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.roadmaps() });
      toast.success('Roadmap deleted');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Assign roadmap to student ─────────────────────────────────
export function useAssignRoadmap(roadmapId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignRequest) => {
      const res = await apiClient.post<ApiEnvelope<StudentRoadmapOut>>(
        `/api/v1/roadmaps/${roadmapId}/assign`,
        data
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.studentRoadmaps(data.student_id) });
      toast.success('Roadmap assigned');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── List student roadmaps ─────────────────────────────────────
export function useStudentRoadmaps(studentId: string) {
  return useQuery({
    queryKey: queryKeys.studentRoadmaps(studentId),
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<StudentRoadmapOut[]>>(
        `/api/v1/students/${studentId}/roadmaps`
      );
      return res.data.data;
    },
    enabled: !!studentId,
  });
}
