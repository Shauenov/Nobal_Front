import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { AdminStats } from '@/types/admin';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/admin/stats');
      return data.data as AdminStats;
    },
    staleTime: 30_000,
  });
}
