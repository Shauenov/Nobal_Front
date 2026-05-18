import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  ApiEnvelope,
  EnrollmentOut,
  EnrollmentUpdateRequest,
  EnrollmentWithStudentOut,
  PaginatedEnvelope,
} from '@/types/api';

// ── List student enrollments ──────────────────────────────────
export function useStudentEnrollments(studentId: string) {
  return useQuery({
    queryKey: queryKeys.studentEnrollments(studentId),
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<EnrollmentOut[]>>(
        `/api/v1/students/${studentId}/enrollments`
      );
      return res.data.data;
    },
    enabled: !!studentId,
  });
}

// ── List university enrollments (Список заявок) ───────────────
export function useUniversityEnrollments(
  universityId: string,
  params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }
) {
  return useQuery({
    queryKey: queryKeys.universityEnrollments(universityId, params),
    queryFn: async () => {
      const res = await apiClient.get<PaginatedEnvelope<EnrollmentWithStudentOut>>(
        `/api/v1/universities/${universityId}/enrollments`,
        { params }
      );
      return res.data;
    },
    enabled: !!universityId,
  });
}

// ── Enroll student in university ──────────────────────────────
export function useEnroll(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (universityId: string) => {
      const res = await apiClient.post<ApiEnvelope<EnrollmentOut>>(
        `/api/v1/students/${studentId}/universities/${universityId}/enroll`
      );
      return res.data.data;
    },
    onSuccess: (_data, universityId) => {
      qc.invalidateQueries({ queryKey: queryKeys.studentEnrollments(studentId) });
      qc.invalidateQueries({ queryKey: queryKeys.universityEnrollments(universityId) });
      toast.success('Студент зачислен в университет');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Update enrollment status / progress ──────────────────────
// studentId can be passed per-call to support both student-view and university-view usage
export function useUpdateEnrollment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      universityId,
      data,
    }: {
      studentId: string;
      universityId: string;
      data: EnrollmentUpdateRequest;
    }) => {
      const res = await apiClient.patch<ApiEnvelope<EnrollmentOut>>(
        `/api/v1/students/${studentId}/universities/${universityId}/enroll`,
        data
      );
      return res.data.data;
    },
    onSuccess: (_data, { studentId, universityId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.studentEnrollments(studentId) });
      qc.invalidateQueries({ queryKey: queryKeys.universityEnrollments(universityId) });
      toast.success('Статус заявки обновлён');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Delete enrollment ─────────────────────────────────────────
export function useDeleteEnrollment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      universityId,
    }: {
      studentId: string;
      universityId: string;
    }) => {
      await apiClient.delete(
        `/api/v1/students/${studentId}/universities/${universityId}/enroll`
      );
    },
    onSuccess: (_data, { studentId, universityId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.studentEnrollments(studentId) });
      qc.invalidateQueries({ queryKey: queryKeys.universityEnrollments(universityId) });
      toast.success('Заявка удалена');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Enroll student (kept for backward compat, studentId via param) ────────────
// useEnroll is defined above and already uses studentId from hook scope.
