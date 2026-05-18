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

type MessageQueryParams = {
  limit?: number;
  offset?: number;
  page?: number;
  page_size?: number;
};

function toMessageQueryParams(params: MessageQueryParams) {
  if (params.limit != null || params.offset != null) {
    return {
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    };
  }

  const pageSize = params.page_size ?? 50;
  const page = params.page ?? 1;

  return {
    limit: pageSize,
    offset: Math.max(0, (page - 1) * pageSize),
  };
}

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

export function useMyConversation() {
  return useQuery({
    queryKey: queryKeys.myConversation,
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<ConversationOut>>('/api/v1/messages/conversations/my');
      return res.data.data;
    },
  });
}

// ── Get messages ──────────────────────────────────────────────
export function useMessages(
  convoId: string,
  params: MessageQueryParams = {}
) {
  const queryParams = toMessageQueryParams(params);

  return useQuery({
    queryKey: queryKeys.messages(convoId, queryParams),
    queryFn: async () => {
      const res = await apiClient.get<PaginatedEnvelope<MessageOut>>(
        `/api/v1/messages/conversations/${convoId}/messages`,
        { params: queryParams }
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
      qc.invalidateQueries({ queryKey: queryKeys.myConversation });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// Send image message (multipart/form-data)
export function useSendImageMessage(convoId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: { image: File; body?: string | null }) => {
      const form = new FormData();
      form.append('image', data.image);
      if (data.body) form.append('body', data.body);

      const res = await apiClient.post<ApiEnvelope<MessageOut>>(
        `/api/v1/messages/conversations/${convoId}/messages/image`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.messages(convoId) });
      qc.invalidateQueries({ queryKey: queryKeys.conversations });
      qc.invalidateQueries({ queryKey: queryKeys.myConversation });
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
      qc.invalidateQueries({ queryKey: queryKeys.myConversation });
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

// Broadcast with image support (multipart)
export function useBroadcastImage() {
  return useMutation({
    mutationFn: async (data: { image?: File; body?: string | null; filter_group?: string | null; ielts_passed?: boolean | null }) => {
      const form = new FormData();
      if (data.image) form.append('image', data.image);
      if (data.body) form.append('body', data.body);
      if (data.filter_group) form.append('filter_group', data.filter_group);
      if (data.ielts_passed != null) form.append('ielts_passed', String(data.ielts_passed));

      const res = await apiClient.post<ApiEnvelope<BroadcastResult>>(
        '/api/v1/messages/broadcast/image',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
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
