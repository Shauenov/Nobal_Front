'use client';

import { useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { UniversityListParams } from '@/types/api';

interface UniversityFiltersProps {
  params: UniversityListParams;
  onParamsChange: (params: UniversityListParams) => void;
}

const sidebarStyle: CSSProperties = {
  width: '280px',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
  borderRight: '1px solid var(--color-border)',
  paddingRight: 'var(--space-4)',
};

const filterGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  color: 'var(--color-text-primary)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-primary)',
};

const selectStyle: CSSProperties = {
  ...inputStyle,
};

const resetButtonStyle: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  cursor: 'pointer',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  color: 'var(--color-text-secondary)',
};

const degreeLevels = ['Bachelor', 'Master', 'PhD', 'Diploma'];

export function UniversityFilters({ params, onParamsChange }: UniversityFiltersProps) {
  const hasActiveFilters = useMemo(
    () =>
      params.country || params.field || params.min_gpa || params.max_tuition || params.degree_level || params.has_scholarship || params.search,
    [params]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onParamsChange({ ...params, search: e.target.value || undefined, page: 1 });
    },
    [params, onParamsChange]
  );

  const handleCountryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onParamsChange({ ...params, country: e.target.value || undefined, page: 1 });
    },
    [params, onParamsChange]
  );

  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onParamsChange({ ...params, field: e.target.value || undefined, page: 1 });
    },
    [params, onParamsChange]
  );

  const handleMinGpaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value ? parseFloat(e.target.value) : undefined;
      onParamsChange({ ...params, min_gpa: value, page: 1 });
    },
    [params, onParamsChange]
  );

  const handleMaxTuitionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value ? parseFloat(e.target.value) : undefined;
      onParamsChange({ ...params, max_tuition: value, page: 1 });
    },
    [params, onParamsChange]
  );

  const handleDegreeLevelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onParamsChange({ ...params, degree_level: e.target.value || undefined, page: 1 });
    },
    [params, onParamsChange]
  );

  const handleScholarshipChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.checked ? true : undefined;
      onParamsChange({ ...params, has_scholarship: value, page: 1 });
    },
    [params, onParamsChange]
  );

  const handleReset = useCallback(() => {
    onParamsChange({ page: 1, page_size: 10 });
  }, [onParamsChange]);

  return (
    <div style={sidebarStyle}>
      <div style={filterGroupStyle}>
        <label style={labelStyle}>Поиск</label>
        <input
          type="text"
          placeholder="Название университета..."
          style={inputStyle}
          value={params.search || ''}
          onChange={handleSearchChange}
        />
      </div>

      <div style={filterGroupStyle}>
        <label style={labelStyle}>Страна</label>
        <input
          type="text"
          placeholder="напр. США, Великобритания..."
          style={inputStyle}
          value={params.country || ''}
          onChange={handleCountryChange}
        />
      </div>

      <div style={filterGroupStyle}>
        <label style={labelStyle}>Направление</label>
        <input
          type="text"
          placeholder="напр. Информатика..."
          style={inputStyle}
          value={params.field || ''}
          onChange={handleFieldChange}
        />
      </div>

      <div style={filterGroupStyle}>
        <label style={labelStyle}>Мин. GPA</label>
        <input
          type="number"
          placeholder="напр. 3.0"
          step="0.1"
          min="0"
          max="4.0"
          style={inputStyle}
          value={params.min_gpa || ''}
          onChange={handleMinGpaChange}
        />
      </div>

      <div style={filterGroupStyle}>
        <label style={labelStyle}>Макс. стоимость (USD)</label>
        <input
          type="number"
          placeholder="напр. 50000"
          min="0"
          style={inputStyle}
          value={params.max_tuition || ''}
          onChange={handleMaxTuitionChange}
        />
      </div>

      <div style={filterGroupStyle}>
        <label style={labelStyle}>Уровень обучения</label>
        <select style={selectStyle} value={params.degree_level || ''} onChange={handleDegreeLevelChange}>
          <option value="">Все уровни</option>
          {degreeLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <input
          type="checkbox"
          id="has_scholarship"
          checked={params.has_scholarship === true}
          onChange={handleScholarshipChange}
          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
        />
        <label htmlFor="has_scholarship" style={{ ...labelStyle, margin: 0, cursor: 'pointer', fontWeight: 'normal' }}>
          Есть стипендия
        </label>
      </div>

      {hasActiveFilters && (
        <button style={resetButtonStyle} onClick={handleReset}>
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}
