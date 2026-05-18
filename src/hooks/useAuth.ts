import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import apiClient, { normalizeError, tokenStorage } from '@/lib/apiClient';
import { queryClient, queryKeys } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import {
  ApiEnvelope,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  TokenResponse,
  UserOut,
} from '@/types/api';

// ── Login ─────────────────────────────────────────────────────
export function useLogin() {
  const { setSession } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await apiClient.post<ApiEnvelope<TokenResponse>>(
        '/api/v1/auth/login',
        data
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      tokenStorage.setTokens(data.access_token, data.refresh_token);
      setSession(data.user, data.access_token, data.refresh_token);
      queryClient.invalidateQueries();
      router.replace('/dashboard');
    },
    onError: (err) => {
      const error = normalizeError(err);
      if (error.status === 401) {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message);
      }
    },
  });
}

// ── Logout ────────────────────────────────────────────────────
export function useLogout() {
  const { clearSession } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = tokenStorage.getRefresh();
      if (refreshToken) {
        await apiClient.post('/api/v1/auth/logout', { refresh_token: refreshToken });
      }
    },
    onSettled: () => {
      tokenStorage.clear();
      clearSession();
      queryClient.clear();
      router.replace('/login');
    },
  });
}

// ── Get current user ──────────────────────────────────────────
export function useMe() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<UserOut>>('/api/v1/users/me');
      return res.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

// ── Forgot Password ───────────────────────────────────────────
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      await apiClient.post('/api/v1/auth/forgot-password', data);
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Reset Password ────────────────────────────────────────────
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      await apiClient.post('/api/v1/auth/reset-password', data);
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
      router.push('/login');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Change Password ───────────────────────────────────────────
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      await apiClient.post('/api/v1/auth/change-password', data);
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Update profile ────────────────────────────────────────────
export function useUpdateMe() {
  const qc = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async (data: { full_name?: string | null; avatar_url?: string | null }) => {
      const res = await apiClient.put<ApiEnvelope<UserOut>>('/api/v1/users/me', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.me, data);
      updateUser({ full_name: data.full_name, email: data.email });
      toast.success('Profile updated');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// ── Upload Avatar ───────────────────────────────────────────────
export function useUploadAvatar() {
  const qc = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post<ApiEnvelope<UserOut>>('/api/v1/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.me, data);
      updateUser({ avatar_url: data.avatar_url });
      toast.success('Avatar uploaded successfully');
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

// Compatibility wrapper for components expecting `useAuth()`
export function useAuth() {
  const { user, isAuthenticated, setSession, clearSession, updateUser } = useAuthStore();

  return {
    user,
    isAuthenticated,
    setSession,
    clearSession,
    updateUser,
    // convenience: existing hooks for actions
    login: useLogin,
    logout: useLogout,
    me: useMe,
    updateMe: useUpdateMe,
    uploadAvatar: useUploadAvatar,
    forgotPassword: useForgotPassword,
    resetPassword: useResetPassword,
    changePassword: useChangePassword,
  } as const;
}
