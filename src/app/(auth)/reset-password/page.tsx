'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import type { ClipboardEvent, CSSProperties, KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { useResetPassword } from '@/hooks/useAuth';
import { ApiError } from '@/types/api';

const resetSchema = z
  .object({
    email: z.string().email('Enter a valid email'),
    otp: z.string().length(6, 'Enter the 6-digit code'),
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type ResetValues = z.infer<typeof resetSchema>;

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

export default function ResetPasswordPage() {
  const reset = useResetPassword();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: '' },
  });

  const otpValue = useMemo(() => otpDigits.join(''), [otpDigits]);

  const updateOtpValue = (next: string[]) => {
    setOtpDigits(next);
    setValue('otp', next.join(''), { shouldValidate: true });
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    updateOtpValue(next);
    if (digit && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    event.preventDefault();
    const next = text.padEnd(6, ' ').split('').map((char) => (char === ' ' ? '' : char));
    updateOtpValue(next);
    const nextIndex = Math.min(text.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      await reset.mutateAsync({
        email: values.email,
        otp: values.otp,
        new_password: values.new_password,
      });
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
      <PageHeader title="Set a new password" subtitle="Use the code we emailed you" />

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
        <label style={labelStyle}>
          Verification code
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {otpDigits.map((digit, index) => (
            <input
              key={`otp-${index}`}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={digit}
              onChange={(event) => handleOtpChange(index, event.target.value)}
              onKeyDown={(event) => handleOtpKeyDown(index, event)}
              onPaste={handleOtpPaste}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              style={{
                ...inputStyle,
                width: 44,
                textAlign: 'center',
                fontSize: 'var(--text-base)',
                padding: '8px 0',
              }}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>
        <input type="hidden" value={otpValue} {...register('otp')} />
        {errors.otp && <span style={errorStyle}>{errors.otp.message}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={labelStyle} htmlFor="new_password">
          New password
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="new_password"
            type={showNewPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            style={{ ...inputStyle, paddingRight: 64 }}
            {...register('new_password')}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((value) => !value)}
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
            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
          >
            {showNewPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.new_password && <span style={errorStyle}>{errors.new_password.message}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={labelStyle} htmlFor="confirm_password">
          Confirm password
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="confirm_password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            style={{ ...inputStyle, paddingRight: 64 }}
            {...register('confirm_password')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
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
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.confirm_password && (
          <span style={errorStyle}>{errors.confirm_password.message}</span>
        )}
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
        disabled={reset.isPending}
        style={{
          width: '100%',
          borderRadius: 'var(--radius-md)',
          border: '1px solid transparent',
          padding: '12px 16px',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: '#fff',
          background: 'var(--color-primary)',
          opacity: reset.isPending ? 0.7 : 1,
        }}
      >
        {reset.isPending ? 'Updating...' : 'Update password'}
      </button>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span>Need to try again?</span>
        <Link href="/login" style={{ color: 'var(--color-primary)' }}>
          Back to login
        </Link>
      </div>
    </form>
  );
}
