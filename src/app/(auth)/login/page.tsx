'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLogin } from '@/hooks/useAuth';
import { ApiError } from '@/types/api';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

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

export default function LoginPage() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setAuthError(null);
    try {
      await login.mutateAsync(values);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 401) {
        setAuthError('Invalid email or password');
      } else {
        setAuthError(apiError.message);
      }
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
    >
      <PageHeader title="Welcome back" subtitle="Sign in to continue" />

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={labelStyle} htmlFor="password">
          Password
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            style={{ ...inputStyle, paddingRight: 64 }}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-xs)',
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && <span style={errorStyle}>{errors.password.message}</span>}
      </div>

      {authError && (
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
          {authError}
        </div>
      )}

      <button
        type="submit"
        disabled={login.isPending}
        style={{
          width: '100%',
          borderRadius: 'var(--radius-md)',
          border: '1px solid transparent',
          padding: '12px 16px',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: '#fff',
          background: 'var(--color-primary)',
          opacity: login.isPending ? 0.7 : 1,
        }}
      >
        {login.isPending ? 'Signing in...' : 'Sign in'}
      </button>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span>Need help signing in?</span>
        <Link href="/forgot-password" style={{ color: 'var(--color-primary)' }}>
          Forgot password
        </Link>
      </div>
    </form>
  );
}
