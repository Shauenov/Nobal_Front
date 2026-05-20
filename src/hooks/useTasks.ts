import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  ApiEnvelope,
  PaginatedTasks,
  TaskCreate,
  TaskHistoryItem,
  TaskListParams,
  TaskOut,
  TaskStatsOut,
  TaskStatusUpdate,
  TaskUpdate,
} from '@/types/api';

// ── List student tasks ────────────────────────────────────────
export function useStudentTasks(studentId: string, params: TaskListParams = {}) {
  return useQuery({
    queryKey: queryKeys.studentTasks(studentId, params as Record<string, unknown>),
    queryFn: async () => {
      const res = await apiClient.get<PaginatedTasks>(
        `/api/v1/students/${studentId}/tasks`,
        { params }
      );
      return res.data;
    },
    enabled: !!studentId,
  });
}

// ── Create task ───────────────────────────────────────────────
export function useCreateTask(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskCreate) => {
      const res = await apiClient.post<ApiEnvelope<TaskOut>>(
        `/api/v1/students/${studentId}/tasks`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.studentTasks(studentId) });
      qc.invalidateQueries({ queryKey: queryKeys.reportsOverview });
      toast.success('Задание создано');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Create personal task ──────────────────────────────────────
export function useCreatePersonalTask() {
  return useMutation({
    mutationFn: async (data: TaskCreate) => {
      const res = await apiClient.post<ApiEnvelope<TaskOut>>('/api/v1/tasks/personal', data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Личное задание создано');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Update task ───────────────────────────────────────────────
export function useUpdateTask(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: TaskUpdate }) => {
      const res = await apiClient.put<ApiEnvelope<TaskOut>>(
        `/api/v1/tasks/${taskId}`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.studentTasks(studentId) });
      toast.success('Задание обновлено');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Update task status (optimistic) ──────────────────────────
export function usePatchTaskStatus(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: TaskStatusUpdate }) => {
      const res = await apiClient.patch<ApiEnvelope<TaskOut>>(
        `/api/v1/tasks/${taskId}/status`,
        data
      );
      return res.data.data;
    },
    onMutate: async ({ taskId, data }) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: queryKeys.studentTasks(studentId) });
      const previous = qc.getQueryData(queryKeys.studentTasks(studentId));
      qc.setQueriesData(
        { queryKey: queryKeys.studentTasks(studentId) },
        (old: PaginatedTasks | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((t) =>
              t.id === taskId ? { ...t, status: data.status } : t
            ),
          };
        }
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.studentTasks(studentId), context.previous);
      }
      toast.error('Не удалось обновить статус задания');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.studentTasks(studentId) });
      qc.invalidateQueries({ queryKey: queryKeys.reportsOverview });
    },
  });
}

// ── Task history ─────────────────────────────────────────────
export function useTaskHistory(taskId: string | null) {
  return useQuery({
    queryKey: ['tasks', 'history', taskId],
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<TaskHistoryItem[]>>(
        `/api/v1/tasks/${taskId}/history`
      );
      return res.data.data;
    },
    enabled: !!taskId,
    staleTime: 30_000,
  });
}

// ── Task stats ────────────────────────────────────────────────
export function useStudentTaskStats(studentId: string, month?: string) {
  return useQuery({
    queryKey: ['tasks', 'stats', studentId, month],
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<TaskStatsOut>>(
        `/api/v1/students/${studentId}/tasks/stats`,
        { params: month ? { month } : undefined }
      );
      return res.data.data;
    },
    enabled: !!studentId,
  });
}

// ── Delete task ───────────────────────────────────────────────
export function useDeleteTask(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.delete(`/api/v1/tasks/${taskId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.studentTasks(studentId) });
      toast.success('Задание удалено');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}
