import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  ApiEnvelope,
  NotificationOut,
  PaginatedEnvelope,
  UnreadCountOut,
} from '@/types/api';

// ── List notifications ────────────────────────────────────────
export function useNotifications(params?: { is_read?: boolean; page?: number; page_size?: number }) {
  return useQuery({
    queryKey: queryKeys.notifications(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await apiClient.get<PaginatedEnvelope<NotificationOut>>(
        '/api/v1/notifications',
        { params }
      );
      return res.data;
    },
    refetchInterval: parseInt(
      process.env.NEXT_PUBLIC_NOTIFICATION_POLL_INTERVAL ?? '30000'
    ),
  });
}

// ── Unread count ──────────────────────────────────────────────
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: queryKeys.notificationsUnreadCount,
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<UnreadCountOut>>(
        '/api/v1/notifications/unread-count'
      );
      return res.data.data;
    },
    refetchInterval: parseInt(
      process.env.NEXT_PUBLIC_NOTIFICATION_POLL_INTERVAL ?? '30000'
    ),
  });
}

// ── Mark single as read (optimistic) ─────────────────────────
export function useMarkNotificationRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/api/v1/notifications/${id}/read`);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications() });
      const previous = qc.getQueryData(queryKeys.notifications());
      qc.setQueriesData(
        { queryKey: queryKeys.notifications() },
        (old: PaginatedEnvelope<NotificationOut> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((n) =>
              n.id === id ? { ...n, is_read: true } : n
            ),
          };
        }
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.notifications(), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications() });
      qc.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
    },
  });
}

// ── Mark all as read ──────────────────────────────────────────
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.patch('/api/v1/notifications/read-all');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications() });
      qc.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
    },
    onError: (err) => {
      console.error(normalizeError(err).message);
    },
  });
}
