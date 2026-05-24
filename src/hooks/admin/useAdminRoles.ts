import { useQuery } from '@tanstack/react-query';
import { listPermissions, listRoles } from '@/lib/adminMock';

export function useAdminRoles() {
  return useQuery({
    queryKey: ['admin-roles'],
    // MOCK: replace with apiClient.get('/api/v1/roles')
    queryFn: () => listRoles(),
  });
}

export function useAdminPermissions() {
  return useQuery({
    queryKey: ['admin-permissions'],
    // MOCK: derived from backend require_* gates
    queryFn: () => listPermissions(),
  });
}
