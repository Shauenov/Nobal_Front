'use client';

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 10px',
        borderRadius: 'var(--radius-full)',
        background: active ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
        color: active ? 'var(--color-success)' : 'var(--color-error)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: active ? 'var(--color-success)' : 'var(--color-error)',
        }}
      />
      {active ? 'Активен' : 'Неактивен'}
    </span>
  );
}

export default StatusPill;
