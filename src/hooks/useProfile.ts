import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient, { normalizeError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  ApiEnvelope,
  DocumentOut,
  NotificationSettingsOut,
  NotificationSettingsUpdate,
  ProfileOut,
  ProfileUpdate,
} from '@/types/api';

// ── Get student profile ───────────────────────────────────────
export function useStudentProfile(studentId: string) {
  return useQuery({
    queryKey: queryKeys.studentProfile(studentId),
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<ProfileOut>>(
        `/api/v1/students/${studentId}/profile`
      );
      return res.data.data;
    },
    enabled: !!studentId,
  });
}

// ── Update student profile ────────────────────────────────────
export function useUpdateStudentProfile(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileUpdate) => {
      const res = await apiClient.put<ApiEnvelope<ProfileOut>>(
        `/api/v1/students/${studentId}/profile`,
        data
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.studentProfile(studentId), data);
      qc.invalidateQueries({ queryKey: queryKeys.student(studentId) });
      toast.success('Профиль обновлён');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── List documents ────────────────────────────────────────────
export function useStudentDocuments(studentId: string) {
  return useQuery({
    queryKey: queryKeys.studentDocuments(studentId),
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<DocumentOut[]>>(
        `/api/v1/students/${studentId}/documents`
      );
      return res.data.data;
    },
    enabled: !!studentId,
  });
}

// ── Upload document ───────────────────────────────────────────
export function useUploadDocument(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, docType, category }: { file: File; docType: string; category: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', docType);
      formData.append('category', category);
      // Setting Content-Type to undefined removes the global 'application/json'
      // default so axios lets the browser set 'multipart/form-data; boundary=...'
      const res = await apiClient.post(
        `/api/v1/students/${studentId}/documents`,
        formData,
        { headers: { 'Content-Type': undefined } },
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.studentDocuments(studentId) });
      toast.success('Документ загружен');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Delete document ───────────────────────────────────────────
export function useDeleteDocument(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (docType: string) => {
      await apiClient.delete(`/api/v1/students/${studentId}/documents/${docType}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.studentDocuments(studentId) });
      toast.success('Документ удалён');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Get notification settings ─────────────────────────────────
export function useNotificationSettings() {
  return useQuery({
    queryKey: queryKeys.notificationSettings,
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<NotificationSettingsOut>>(
        '/api/v1/users/me/notification-settings'
      );
      return res.data.data;
    },
  });
}

// ── Update notification settings ──────────────────────────────
export function useUpdateNotificationSettings() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: NotificationSettingsUpdate) => {
      const res = await apiClient.put<ApiEnvelope<NotificationSettingsOut>>(
        '/api/v1/users/me/notification-settings',
        data
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.notificationSettings, data);
      toast.success('Настройки уведомлений сохранены');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}
