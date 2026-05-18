import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ── Token storage helpers ─────────────────────────────────────
const TOKEN_KEY = 'nobal_access_token';
const REFRESH_KEY = 'nobal_refresh_token';

export const tokenStorage = {
  getAccess: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefresh: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ── Axios instance ────────────────────────────────────────────
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Request interceptor — inject Bearer token ─────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Flag to prevent multiple concurrent refresh calls ─────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// ── Response interceptor — handle 401 auto-refresh & error codes ───
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status ?? 0;

    // Handle 401 Unauthorized — attempt token refresh
    if (status === 401 && !originalRequest._retry) {
      const refreshToken = tokenStorage.getRefresh();

      if (!refreshToken) {
        tokenStorage.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login?reason=session_expired';
        }
        return Promise.reject(normalizeError(error));
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers!.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const newAccess: string = data.data.access_token;
        const newRefresh: string = data.data.refresh_token;
        tokenStorage.setTokens(newAccess, newRefresh);
        processQueue(null, newAccess);
        originalRequest.headers!.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login?reason=session_expired';
        }
        return Promise.reject(normalizeError(refreshError as AxiosError));
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden — redirect to unauthorized page
    if (status === 403) {
      // Allow callers to opt-out of automatic redirect by setting
      // request header `x-skip-unauthorized-redirect`.
      const skipRedirect = Boolean(
        (originalRequest.headers as Record<string, string | undefined> | undefined)?.[
          'x-skip-unauthorized-redirect'
        ]
      );

      if (!skipRedirect) {
        if (typeof window !== 'undefined') {
          window.location.href = '/unauthorized';
        }
      }

      return Promise.reject(normalizeError(error));
    }

    // Handle 404 Not Found — can be handled by page-level error boundaries
    if (status === 404) {
      return Promise.reject(normalizeError(error));
    }

    // Handle 422 Unprocessable Entity — validation errors
    if (status === 422) {
      return Promise.reject(normalizeError(error));
    }

    // Handle 500+ Server Errors — log and reject
    if (status >= 500) {
      console.error('[API Error 5xx]', {
        status,
        url: error.config?.url,
        message: error.message,
      });
      return Promise.reject(normalizeError(error));
    }

    return Promise.reject(normalizeError(error));
  }
);

// ── Error normalizer ──────────────────────────────────────────
export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const responseData = error.response?.data;
    const message =
      responseData?.detail?.[0]?.msg ??
      responseData?.message ??
      responseData?.detail ??
      error.message ??
      'An unexpected error occurred';

    return {
      status,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      detail: Array.isArray(responseData?.detail) ? responseData.detail : undefined,
    };
  }

  return {
    status: 0,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

export default apiClient;
