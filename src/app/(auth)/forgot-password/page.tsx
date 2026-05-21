'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForgotPassword } from '@/hooks/useAuth';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

const forgotSchema = z.object({
  email: z.string().email('Введите корректный email'),
});

type ForgotValues = z.infer<typeof forgotSchema>;

const inputWrapStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  padding: '14px 44px 14px 16px',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
};

const errorStyle: CSSProperties = {
  color: 'var(--color-error)',
  fontSize: 'var(--text-xs)',
};

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      await forgot.mutateAsync(values);
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      setApiError(message);
    }
  });

  return (
    <>
    <LoadingOverlay visible={forgot.isPending} />
    <form
      onSubmit={onSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
    >
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h1
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Сброс пароля
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
          Введите email — отправим код на 6 цифр
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={inputWrapStyle}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Почта"
            style={inputStyle}
            {...register('email')}
          />
          <span style={{ position: 'absolute', right: 14, color: 'var(--color-text-secondary)', pointerEvents: 'none' }} aria-hidden>
            <MailIcon />
          </span>
        </div>
        {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
      </div>

      {apiError && (
        <div
          style={{
            border: '1px solid var(--color-error)',
            background: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
          }}
        >
          {apiError}
        </div>
      )}

      <button
        type="submit"
        disabled={forgot.isPending}
        style={{
          width: '100%',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid transparent',
          padding: '14px 16px',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-semibold)',
          color: '#fff',
          background: 'var(--color-primary)',
          opacity: forgot.isPending ? 0.7 : 1,
        }}
      >
        {forgot.isPending ? 'Отправка...' : 'Отправить код'}
      </button>

      <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
        Вспомнили пароль?{' '}
        <a href="/login" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-medium)' }}>
          Войти
        </a>
      </div>
    </form>
    </>
  );
}
