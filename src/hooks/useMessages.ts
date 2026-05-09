import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  ApiEnvelope,
  BroadcastRequest,
  BroadcastResult,
  ConversationOut,
  MessageOut,
  PaginatedEnvelope,
  SendMessageRequest,
} from '@/types/api';

// ── List conversations ────────────────────────────────────────
export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<ConversationOut[]>>('/api/v1/messages/conversations');
      return res.data.data;
    },
    refetchInterval: parseInt(
      process.env.NEXT_PUBLIC_CHAT_POLL_INTERVAL ?? '10000'
    ),
  });
}

// ── Get or create conversation with student ───────────────────
export function useGetOrCreateConversation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      const res = await apiClient.post<ApiEnvelope<ConversationOut>>(
        '/api/v1/messages/conversations',
        { student_id: studentId }
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

// ── Get messages ──────────────────────────────────────────────
export function useMessages(
  convoId: string,
  params: { page?: number; page_size?: number } = {}
) {
  return useQuery({
    queryKey: queryKeys.messages(convoId, params as Record<string, unknown>),
    queryFn: async () => {
      const res = await apiClient.get<PaginatedEnvelope<MessageOut>>(
        `/api/v1/messages/conversations/${convoId}/messages`,
        { params }
      );
      return res.data;
    },
    enabled: !!convoId,
    refetchInterval: parseInt(
      process.env.NEXT_PUBLIC_CHAT_POLL_INTERVAL ?? '10000'
    ),
  });
}

// ── Send message ──────────────────────────────────────────────
export function useSendMessage(convoId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      const res = await apiClient.post<ApiEnvelope<MessageOut>>(
        `/api/v1/messages/conversations/${convoId}/messages`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.messages(convoId) });
      qc.invalidateQueries({ queryKey: queryKeys.conversations });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Mark conversation as read ─────────────────────────────────
export function useMarkRead(convoId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/api/v1/messages/conversations/${convoId}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

// ── Broadcast message ─────────────────────────────────────────
export function useBroadcast() {
  return useMutation({
    mutationFn: async (data: BroadcastRequest) => {
      const res = await apiClient.post<ApiEnvelope<BroadcastResult>>(
        '/api/v1/messages/broadcast',
        data
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      toast.success(`Message sent to ${data.sent} student(s)`);
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}
