'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

interface LocaleProviderProps {
  locale: string;
  messages: Record<string, unknown>;
  children: ReactNode;
}

export function LocaleProvider({ locale, messages, children }: LocaleProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
