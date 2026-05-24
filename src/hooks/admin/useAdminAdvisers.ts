import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { AdminAdviserOut, Paginated } from '@/types/admin';

interface AdminAdvisersParams {
  search?: string;
  page?: number;
  page_size?: number;
}

export function useAdminAdvisers(params: AdminAdvisersParams = {}) {
  return useQuery({
    queryKey: ['admin-advisers', params],
    queryFn: async () => {
      const p: Record<string, string | number> = {};
      if (params.search) p.search = params.search;
      if (params.page) p.page = params.page;
      if (params.page_size) p.page_size = params.page_size;
      const { data } = await apiClient.get('/api/v1/admin/advisers', { params: p });
      return data as Paginated<AdminAdviserOut>;
    },
    placeholderData: (prev) => prev,
  });
}

/** Fetch a single adviser profile (real endpoint: GET /advisers/{id}) */
export function useAdviserProfile(adviserId: string | undefined) {
  return useQuery({
    queryKey: ['adviser-profile', adviserId],
    enabled: !!adviserId,
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/advisers/${adviserId}`);
      return data.data as {
        user_id: string;
        full_name: string;
        avatar_url: string | null;
        headline: string | null;
        bio: string | null;
        skills: string[];
        students_placed: number | null;
        scholarships_won_usd: number | null;
        years_experience: number | null;
        rating_avg: number;
        reviews_count: number;
      };
    },
  });
}

/** Fetch reviews for an adviser (real endpoint: GET /advisers/{id}/reviews) */
export function useAdviserReviews(adviserId: string | undefined) {
  return useQuery({
    queryKey: ['adviser-reviews', adviserId],
    enabled: !!adviserId,
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/advisers/${adviserId}/reviews`);
      return data as {
        data: { id: string; author_name: string | null; rating: number; text: string | null; created_at: string }[];
        meta: { rating_avg: number; count: number };
      };
    },
  });
}
