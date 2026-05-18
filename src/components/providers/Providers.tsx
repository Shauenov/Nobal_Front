'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { useUIStore } from '@/stores/uiStore';
import enMessages from '../../../messages/en.json';
import ruMessages from '../../../messages/ru.json';

const messages = { en: enMessages, ru: ruMessages };

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const locale = useUIStore((s) => s.locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-surface-elevated)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'var(--color-bg)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'var(--color-bg)',
            },
          },
          duration: 4000,
        }}
      />
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}
