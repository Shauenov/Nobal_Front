import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMessages } from '../useMessages';

const getMock = vi.fn();

vi.mock('@/lib/apiClient', () => ({
  default: {
    get: (...args: unknown[]) => getMock(...args),
    post: vi.fn(),
    patch: vi.fn(),
  },
  normalizeError: (error: { message?: string }) => ({ message: error.message ?? 'Request failed' }),
}));

function createWrapper() {
  const queryClient = new QueryClient();

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useMessages', () => {
  it('maps page params to limit and offset for message history requests', async () => {
    getMock.mockResolvedValueOnce({ data: { data: [], meta: { page: 2, page_size: 25, total: 0 } } });

    const { result } = renderHook(
      () => useMessages('convo-1', { page: 2, page_size: 25 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getMock).toHaveBeenCalledWith(
      '/api/v1/messages/conversations/convo-1/messages',
      { params: { limit: 25, offset: 25 } },
    );
  });

  it('uses explicit limit and offset when provided', async () => {
    getMock.mockResolvedValueOnce({ data: { data: [], meta: { page: 1, page_size: 50, total: 0 } } });

    renderHook(
      () => useMessages('convo-2', { limit: 12, offset: 48 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith(
        '/api/v1/messages/conversations/convo-2/messages',
        { params: { limit: 12, offset: 48 } },
      );
    });
  });
});