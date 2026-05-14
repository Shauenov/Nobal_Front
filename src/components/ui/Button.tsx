'use client';

import React, { ButtonHTMLAttributes, CSSProperties, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  style?: CSSProperties;
  className?: string;
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', style, className, children, leftIcon, rightIcon, ...rest }, ref) => {
    const sizeStyles: Record<Size, CSSProperties> = {
      sm: { padding: '6px 10px', fontSize: 'var(--text-sm)' },
      md: { padding: '8px 12px', fontSize: 'var(--text-base)' },
      lg: { padding: '10px 16px', fontSize: 'var(--text-lg)' },
    };

    const variantStyles: Record<Variant, CSSProperties> = {
      primary: {
        background: 'var(--color-primary)',
        color: '#fff',
        border: '1px solid transparent',
      },
      secondary: {
        background: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--color-text-primary)',
        border: '1px solid transparent',
      },
      danger: {
        background: 'var(--color-error)',
        color: '#fff',
        border: '1px solid transparent',
      },
    };

    const base: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'all 0.12s ease',
      boxShadow: 'var(--shadow-xs)',
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };

    return (
      <button ref={ref} style={base} className={className} {...rest}>
        {leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
