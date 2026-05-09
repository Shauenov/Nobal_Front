import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryClient';
import {
  ApiEnvelope,
  OverviewReport,
  StudentProgressItem,
  UniversityStats,
} from '@/types/api';

// ── Overview report ───────────────────────────────────────────
export function useOverviewReport() {
  return useQuery({
    queryKey: queryKeys.reportsOverview,
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<OverviewReport>>(
        '/api/v1/reports/overview'
      );
      return res.data.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// ── Students progress report ──────────────────────────────────
export function useStudentsReport(params?: {
  group_type?: string;
  course_year?: number;
}) {
  return useQuery({
    queryKey: queryKeys.reportsStudents,
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<StudentProgressItem[]>>(
        '/api/v1/reports/students',
        { params }
      );
      return res.data.data;
    },
    staleTime: 60 * 1000,
  });
}

// ── Universities / admission stats report ─────────────────────
export function useUniversitiesReport() {
  return useQuery({
    queryKey: queryKeys.reportsUniversities,
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<UniversityStats>>(
        '/api/v1/reports/universities'
      );
      return res.data.data;
    },
    staleTime: 60 * 1000,
  });
}
