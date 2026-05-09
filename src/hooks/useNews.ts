import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  AddToCalendarRequest,
  ApiEnvelope,
  NewsCreate,
  NewsListParams,
  NewsOut,
  NewsUpdate,
  PaginatedNews,
} from '@/types/api';

// ── List news ─────────────────────────────────────────────────
export function useNews(params: NewsListParams = {}) {
  return useQuery({
    queryKey: queryKeys.news(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await apiClient.get<PaginatedNews>('/api/v1/news', { params });
      return res.data;
    },
  });
}

// ── Get single news ───────────────────────────────────────────
export function useNewsItem(id: string) {
  return useQuery({
    queryKey: queryKeys.newsItem(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<NewsOut>>(`/api/v1/news/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

// ── Create news ───────────────────────────────────────────────
export function useCreateNews() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: NewsCreate) => {
      const res = await apiClient.post<ApiEnvelope<NewsOut>>('/api/v1/news', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.news() });
      toast.success('News article created');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Update news ───────────────────────────────────────────────
export function useUpdateNews(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: NewsUpdate) => {
      const res = await apiClient.put<ApiEnvelope<NewsOut>>(`/api/v1/news/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.newsItem(id) });
      qc.invalidateQueries({ queryKey: queryKeys.news() });
      toast.success('News article updated');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Delete news ───────────────────────────────────────────────
export function useDeleteNews() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/news/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.news() });
      toast.success('News article deleted');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Add news to calendar ──────────────────────────────────────
export function useAddNewsToCalendar(newsId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddToCalendarRequest) => {
      await apiClient.post(`/api/v1/news/${newsId}/add-to-calendar`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.calendar() });
      toast.success('Added to calendar');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}
