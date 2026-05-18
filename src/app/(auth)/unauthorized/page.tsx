import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';

export default function UnauthorizedPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <PageHeader
        title="Access denied"
        subtitle="You do not have permission to view this page."
      />

      <div
        style={{
          border: '1px solid var(--color-warning)',
          background: 'var(--color-surface-hover)',
          color: 'var(--color-text-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          fontSize: 'var(--text-sm)',
          lineHeight: 1.5,
        }}
      >
        If this is unexpected, contact your administrator or sign in with an account that has the required role.
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Link
          href="/login"
          style={{
            flex: 1,
            textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            border: '1px solid transparent',
            padding: '10px 12px',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            color: '#fff',
            background: 'var(--color-primary)',
            textDecoration: 'none',
          }}
        >
          Go to login
        </Link>

        <Link
          href="/dashboard"
          style={{
            flex: 1,
            textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            padding: '10px 12px',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-primary)',
            background: 'var(--color-surface)',
            textDecoration: 'none',
          }}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
