import { PageHeader } from './PageHeader';

interface PageStubProps {
  title: string;
  description?: string;
}

export function PageStub({ title, description }: PageStubProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader
        title={title}
        subtitle={description ?? 'This section will be implemented next.'}
      />
      <div
        style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-secondary)',
        }}
      >
        Work is in progress for this section.
      </div>
    </div>
  );
}
