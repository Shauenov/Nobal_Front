import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  ApiEnvelope,
  InviteStudentRequest,
  PaginatedStudents,
  StudentDetail,
  StudentListParams,
  UserOut,
} from '@/types/api';

// ── List students ─────────────────────────────────────────────
export function useStudents(params: StudentListParams = {}) {
  return useQuery({
    queryKey: queryKeys.students(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await apiClient.get<PaginatedStudents>('/api/v1/students', {
        params: { ...params, page: params.page ?? 1, page_size: params.page_size ?? 20 },
      });
      return res.data;
    },
  });
}

// ── Get single student ────────────────────────────────────────
export function useStudent(studentId: string) {
  return useQuery({
    queryKey: queryKeys.student(studentId),
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<StudentDetail>>(
        `/api/v1/students/${studentId}`
      );
      return res.data.data;
    },
    enabled: !!studentId,
  });
}

// ── Invite student ────────────────────────────────────────────
export function useInviteStudent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteStudentRequest) => {
      const res = await apiClient.post<ApiEnvelope<UserOut>>(
        '/api/v1/conductor/students/invite',
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.students() });
      toast.success('Student invited successfully');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Delete student ────────────────────────────────────────────
export function useDeleteStudent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      await apiClient.delete(`/api/v1/students/${studentId}`);
      return studentId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.students() });
      toast.success('Student deleted');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}
