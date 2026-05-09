'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { useForgotPassword } from '@/hooks/useAuth';
import { ApiError } from '@/types/api';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

type ForgotValues = z.infer<typeof forgotSchema>;

const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  padding: '10px 12px',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  color: 'var(--color-text-secondary)',
};

const errorStyle: CSSProperties = {
  color: 'var(--color-error)',
  fontSize: 'var(--text-xs)',
};

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);
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
      setSubmitted(true);
    } catch (err) {
      const apiErr = err as ApiError;
      setApiError(apiErr.message);
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
    >
      <PageHeader title="Reset password" subtitle="We will email you a 6-digit code" />

      {submitted ? (
        <div
          style={{
            border: '1px solid var(--color-success)',
            background: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
          }}
        >
          Check your email for the reset code.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              style={inputStyle}
              {...register('email')}
            />
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
              borderRadius: 'var(--radius-md)',
              border: '1px solid transparent',
              padding: '12px 16px',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              color: '#fff',
              background: 'var(--color-primary)',
              opacity: forgot.isPending ? 0.7 : 1,
            }}
          >
            {forgot.isPending ? 'Sending...' : 'Send reset code'}
          </button>
        </>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span>Remember your password?</span>
        <Link href="/login" style={{ color: 'var(--color-primary)' }}>
          Back to login
        </Link>
      </div>
    </form>
  );
}
