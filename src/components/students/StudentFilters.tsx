import type { ChangeEvent, CSSProperties } from 'react';

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
        <label style={labelStyle}>Group</label>
        <select style={selectStyle} value={groupType} onChange={handleChange('group_type')}>
          <option value="">All</option>
          <option value="D">D</option>
          <option value="F">F</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={labelStyle}>Course Year</label>
        <select style={selectStyle} value={courseYear} onChange={handleChange('course_year')}>
          <option value="">All</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={labelStyle}>IELTS</label>
        <select style={selectStyle} value={ieltsPassed} onChange={handleChange('ielts_passed')}>
          <option value="">All</option>
          <option value="true">Passed</option>
          <option value="false">Not passed</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={labelStyle}>SAT</label>
        <select style={selectStyle} value={satPassed} onChange={handleChange('sat_passed')}>
          <option value="">All</option>
          <option value="true">Passed</option>
          <option value="false">Not passed</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', gridColumn: 'span 2' }}>
        <label style={labelStyle}>Search</label>
        <input
          style={inputStyle}
          placeholder="Search by name or email"
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
          Invite Student
        </button>
      </div>
    </div>
  );
}
