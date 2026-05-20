'use client';

import type { ChangeEvent, CSSProperties } from 'react';
import { useTranslations } from 'next-intl';

interface StudentFiltersProps {
  groupType: string;
  courseYear: string;
  ieltsPassed: string;
  satPassed: string;
  search: string;
  onFilterChange: (key: string, value: string) => void;
  onSearchChange: (value: string) => void;
  onInvite: () => void;
}

const selectStyle: CSSProperties = {
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  padding: '8px 10px',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
};

const inputStyle: CSSProperties = {
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  padding: '8px 10px',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
  width: '100%',
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

export function StudentFilters({
  groupType,
  courseYear,
  ieltsPassed,
  satPassed,
  search,
  onFilterChange,
  onSearchChange,
  onInvite,
}: StudentFiltersProps) {
  const t = useTranslations('students');
  const handleChange = (key: string) => (event: ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(key, event.target.value);
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--space-3)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        alignItems: 'end',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={labelStyle}>{t('filters.group')}</label>
        <select style={selectStyle} value={groupType} onChange={handleChange('group_type')}>
          <option value="">{t('filters.all')}</option>
          <optgroup label="D">
            <option value="D">D (все)</option>
            <option value="D1">D1</option>
            <option value="D2">D2</option>
          </optgroup>
          <optgroup label="F">
            <option value="F">F (все)</option>
            <option value="F1">F1</option>
            <option value="F2">F2</option>
            <option value="F3">F3</option>
            <option value="F4">F4</option>
          </optgroup>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={labelStyle}>{t('filters.courseYear')}</label>
        <select style={selectStyle} value={courseYear} onChange={handleChange('course_year')}>
          <option value="">{t('filters.all')}</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={labelStyle}>{t('filters.ielts')}</label>
        <select style={selectStyle} value={ieltsPassed} onChange={handleChange('ielts_passed')}>
          <option value="">{t('filters.all')}</option>
          <option value="true">{t('filters.passed')}</option>
          <option value="false">{t('filters.notPassed')}</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={labelStyle}>{t('filters.sat')}</label>
        <select style={selectStyle} value={satPassed} onChange={handleChange('sat_passed')}>
          <option value="">{t('filters.all')}</option>
          <option value="true">{t('filters.passed')}</option>
          <option value="false">{t('filters.notPassed')}</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', gridColumn: 'span 2' }}>
        <label style={labelStyle}>{t('searchPlaceholder')}</label>
        <input
          style={inputStyle}
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onInvite}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid transparent',
            background: 'var(--color-primary)',
            color: '#fff',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
          }}
        >
          {t('inviteStudent')}
        </button>
      </div>
    </div>
  );
}
