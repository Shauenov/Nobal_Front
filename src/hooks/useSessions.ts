import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import type { SessionOut } from '@/types/api';

interface SessionsResponse {
  success: boolean;
  data: SessionOut[];
}

// ── List all active sessions ──────────────────────────────────
export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: async () => {
      const res = await apiClient.get<SessionsResponse>('/api/v1/auth/sessions');
      return res.data.data;
    },
  });
}

// ── Revoke a single session ───────────────────────────────────
export function useRevokeSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await apiClient.delete(`/api/v1/auth/sessions/${sessionId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sessions });
      toast.success('Сеанс завершён');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Revoke all sessions except the current one ────────────────
export function useRevokeAllSessions() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/api/v1/auth/sessions');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sessions });
      toast.success('Все другие сеансы завершены');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}
