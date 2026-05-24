import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getSystemSettings, listAudit, updateSystemSettings } from '@/lib/adminMock';
import type { SystemSettings } from '@/types/admin';

export function useSystemSettings() {
  return useQuery({
    queryKey: ['admin-system-settings'],
    // MOCK: replace with apiClient.get('/api/v1/system/settings')
    queryFn: () => getSystemSettings(),
  });
}

export function useUpdateSystemSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<SystemSettings>) => updateSystemSettings(patch),
    onSuccess: (data) => {
      qc.setQueryData(['admin-system-settings'], data);
      toast.success('Настройки сохранены');
    },
    onError: () => toast.error('Не удалось сохранить настройки'),
  });
}

export function useAuditLog() {
  return useQuery({
    queryKey: ['admin-audit'],
    // MOCK: replace with apiClient.get('/api/v1/system/audit')
    queryFn: () => listAudit(),
  });
}
