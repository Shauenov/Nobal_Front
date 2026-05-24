'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import type { SystemSettings } from '@/types/admin';
import { useSystemSettings, useUpdateSystemSettings } from '@/hooks/admin/useAdminSystem';
import { cardStyle, sectionTitleStyle, inputStyle, labelStyle, ADMIN_ACCENT } from './adminTheme';
import { Skeleton } from '@/components/ui/Skeleton';

export function SystemSettingsForm() {
  const { data, isLoading } = useSystemSettings();
  const update = useUpdateSystemSettings();
  // Local edits layered over server data — avoids syncing state in an effect.
  const [overrides, setOverrides] = useState<Partial<SystemSettings>>({});

  if (isLoading || !data) return <Skeleton style={{ height: 360, borderRadius: 12 }} />;

  const form: SystemSettings = { ...data, ...overrides };

  const set = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) =>
    setOverrides((o) => ({ ...o, [key]: value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* General */}
      <section style={cardStyle}>
        <h2 style={{ ...sectionTitleStyle, marginBottom: 'var(--space-4)' }}>Общие</h2>
        <Field label="Название платформы">
          <input style={inputStyle} value={form.brand_name} onChange={(e) => set('brand_name', e.target.value)} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
          <Toggle label="Регистрация открыта" value={form.signups_enabled} onChange={(v) => set('signups_enabled', v)} />
          <Toggle label="Режим обслуживания" value={form.maintenance_mode} onChange={(v) => set('maintenance_mode', v)} danger />
        </div>
      </section>

      {/* Email */}
      <section style={cardStyle}>
        <h2 style={{ ...sectionTitleStyle, marginBottom: 'var(--space-4)' }}>Почта (SMTP)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
          <Field label="SMTP хост"><input style={inputStyle} value={form.email_host} onChange={(e) => set('email_host', e.target.value)} /></Field>
          <Field label="Порт"><input type="number" style={inputStyle} value={form.email_port} onChange={(e) => set('email_port', Number(e.target.value))} /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
          <Field label="Имя отправителя"><input style={inputStyle} value={form.email_from_name} onChange={(e) => set('email_from_name', e.target.value)} /></Field>
          <Field label="Email отправителя"><input style={inputStyle} value={form.email_from_address} onChange={(e) => set('email_from_address', e.target.value)} /></Field>
        </div>
      </section>

      {/* Limits */}
      <section style={cardStyle}>
        <h2 style={{ ...sectionTitleStyle, marginBottom: 'var(--space-4)' }}>Лимиты загрузок</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Field label="Документ, МБ"><input type="number" style={inputStyle} value={form.max_document_size_mb} onChange={(e) => set('max_document_size_mb', Number(e.target.value))} /></Field>
          <Field label="Изображение, МБ"><input type="number" style={inputStyle} value={form.max_image_size_mb} onChange={(e) => set('max_image_size_mb', Number(e.target.value))} /></Field>
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => update.mutate(form)}
          disabled={update.isPending}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 'var(--radius-md)', border: 'none', background: ADMIN_ACCENT, color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: update.isPending ? 0.7 : 1 }}
        >
          <Save size={16} /> {update.isPending ? 'Сохранение…' : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange, danger }: { label: string; value: boolean; onChange: (v: boolean) => void; danger?: boolean }) {
  const on = value;
  const accent = danger ? 'var(--color-error)' : ADMIN_ACCENT;
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer' }}
    >
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{label}</span>
      <span style={{ width: 40, height: 22, borderRadius: 'var(--radius-full)', background: on ? accent : 'var(--color-border-light)', position: 'relative', transition: 'background 150ms ease', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 150ms ease', boxShadow: 'var(--shadow-xs)' }} />
      </span>
    </button>
  );
}

export default SystemSettingsForm;
