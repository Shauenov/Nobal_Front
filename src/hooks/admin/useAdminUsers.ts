import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '@/lib/apiClient';
import type { AdminUserListParams, CreateUserInput, Role } from '@/types/admin';
import type { AdminUser, Paginated } from '@/types/admin';

const KEY = 'admin-users';

function buildParams(params: AdminUserListParams) {
  const p: Record<string, string | number> = {};
  if (params.search) p.search = params.search;
  if (params.role && params.role !== 'all') p.role = params.role;
  if (params.status && params.status !== 'all') p.status = params.status;
  if (params.sort_by) p.sort_by = params.sort_by;
  if (params.sort_dir) p.sort_dir = params.sort_dir;
  if (params.page) p.page = params.page;
  if (params.page_size) p.page_size = params.page_size;
  return p;
}

export function useAdminUsers(params: AdminUserListParams = {}) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/admin/users', { params: buildParams(params) });
      return data as Paginated<AdminUser>;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const { data } = await apiClient.post('/api/v1/admin/users', input);
      return data.data as AdminUser;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Пользователь создан');
    },
    onError: () => toast.error('Не удалось создать пользователя'),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const { data } = await apiClient.patch(`/api/v1/admin/users/${id}`, { role });
      return data.data as AdminUser;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Роль обновлена');
    },
    onError: () => toast.error('Не удалось обновить роль'),
  });
}

export function useSetUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data } = await apiClient.patch(`/api/v1/admin/users/${id}`, { is_active });
      return data.data as AdminUser;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success(vars.is_active ? 'Аккаунт активирован' : 'Аккаунт деактивирован');
    },
    onError: () => toast.error('Не удалось изменить статус'),
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/admin/users/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Пользователь удалён');
    },
    onError: () => toast.error('Не удалось удалить пользователя'),
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: async ({ id, new_password }: { id: string; new_password: string }) => {
      await apiClient.post(`/api/v1/admin/users/${id}/reset-password`, { new_password });
    },
    onSuccess: () => toast.success('Пароль сброшен'),
    onError: () => toast.error('Не удалось сбросить пароль'),
  });
}
