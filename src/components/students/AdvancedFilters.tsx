'use client';

import { useState, type CSSProperties } from 'react';
import { SlidersHorizontal, X, Save, Bookmark } from 'lucide-react';

export interface FilterState {
  groupType: string;
  courseYear: string;
  ieltsPassed: string;
  satPassed: string;
}

interface SavedFilter {
  name: string;
  filters: FilterState;
}

interface AdvancedFiltersProps {
  groupType: string;
  courseYear: string;
  ieltsPassed: string;
  satPassed: string;
  search: string;
  onFilterChange: (key: string, value: string) => void;
  onSearchChange: (value: string) => void;
  /** Called with all four filter values at once — avoids sequential router.replace races */
  onClearAll?: () => void;
  /** Called with a complete saved filter preset — applies all four values atomically */
  onLoadFilter?: (filters: FilterState) => void;
}

const STORAGE_KEY = 'nobal-student-filters-saved';

function loadSaved(): SavedFilter[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveToDisk(filters: SavedFilter[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
}

/* ─── Chip button ─── */
const chip = (active: boolean, color = '#2563eb'): CSSProperties => ({
  padding: '5px 14px',
  borderRadius: 20,
  border: `1px solid ${active ? color : '#e2e8f0'}`,
  background: active ? color : '#fff',
  color: active ? '#fff' : '#475569',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
});

const sectionLabel: CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 6,
};

export function AdvancedFilters({
  groupType,
  courseYear,
  ieltsPassed,
  satPassed,
  search,
  onFilterChange,
  onSearchChange,
  onClearAll,
  onLoadFilter,
}: AdvancedFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => loadSaved());
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const activeCount = [groupType, courseYear, ieltsPassed, satPassed].filter(Boolean).length;

  const currentState: FilterState = { groupType, courseYear, ieltsPassed, satPassed };

  const handleSave = () => {
    if (!saveName.trim()) return;
    const updated = [...savedFilters.filter((f) => f.name !== saveName.trim()), { name: saveName.trim(), filters: currentState }];
    setSavedFilters(updated);
    saveToDisk(updated);
    setSaveName('');
    setShowSaveInput(false);
  };

  const handleLoad = (f: SavedFilter) => {
    if (onLoadFilter) {
      // Batch update: single router.replace, avoids sequential overwrites
      onLoadFilter(f.filters);
    } else {
      onFilterChange('group_type', f.filters.groupType);
      onFilterChange('course_year', f.filters.courseYear);
      onFilterChange('ielts_passed', f.filters.ieltsPassed);
      onFilterChange('sat_passed', f.filters.satPassed);
    }
  };

  const handleDeleteSaved = (name: string) => {
    const updated = savedFilters.filter((f) => f.name !== name);
    setSavedFilters(updated);
    saveToDisk(updated);
  };

  const clearAll = () => {
    if (onClearAll) {
      // Batch update: single router.replace + resets search
      onClearAll();
    } else {
      onFilterChange('group_type', '');
      onFilterChange('course_year', '');
      onFilterChange('ielts_passed', '');
      onFilterChange('sat_passed', '');
      onSearchChange('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Top bar: search + toggle + invite */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#fff',
              fontSize: '0.875rem',
              color: '#1e293b',
            }}
            placeholder="Поиск по имени..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 14px', borderRadius: 8,
            border: `1px solid ${expanded || activeCount > 0 ? '#2563eb' : '#e2e8f0'}`,
            background: expanded || activeCount > 0 ? '#eff6ff' : '#fff',
            color: expanded || activeCount > 0 ? '#2563eb' : '#475569',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={14} />
          Фильтры
          {activeCount > 0 && (
            <span style={{
              background: '#2563eb', color: '#fff',
              borderRadius: 9999, minWidth: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, padding: '0 4px',
            }}>
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '9px 12px', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#fff',
              color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer',
            }}
          >
            <X size={13} /> Сбросить
          </button>
        )}
      </div>

      {/* Expanded filter panel */}
      {expanded && (
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {/* Group */}
            <div>
              <div style={sectionLabel}>Группа</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['', 'D', 'D1', 'D2', 'F', 'F1', 'F2', 'F3', 'F4'] as const).map((g) => (
                  <button key={g || 'all'} type="button"
                    style={chip(groupType === g)}
                    onClick={() => onFilterChange('group_type', g)}>
                    {g === '' ? 'Все' : g}
                  </button>
                ))}
              </div>
            </div>

            {/* Course year */}
            <div>
              <div style={sectionLabel}>Курс</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['', '2', '3'] as const).map((y) => (
                  <button key={y || 'all'} type="button"
                    style={chip(courseYear === y)}
                    onClick={() => onFilterChange('course_year', y)}>
                    {y === '' ? 'Любой' : `${y}-й курс`}
                  </button>
                ))}
              </div>
            </div>

            {/* IELTS */}
            <div>
              <div style={sectionLabel}>IELTS</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[{ v: '', label: 'Любой' }, { v: 'true', label: 'Сдал' }, { v: 'false', label: 'Не сдал' }].map(({ v, label }) => (
                  <button key={v || 'any'} type="button"
                    style={chip(ieltsPassed === v, '#7c3aed')}
                    onClick={() => onFilterChange('ielts_passed', v)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* SAT */}
            <div>
              <div style={sectionLabel}>SAT</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[{ v: '', label: 'Любой' }, { v: 'true', label: 'Сдал' }, { v: 'false', label: 'Не сдал' }].map(({ v, label }) => (
                  <button key={v || 'any'} type="button"
                    style={chip(satPassed === v, '#7c3aed')}
                    onClick={() => onFilterChange('sat_passed', v)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save / load presets */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ ...sectionLabel, marginBottom: 0 }}>Сохранённые фильтры</span>

              {savedFilters.map((f) => (
                <span
                  key={f.name}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 9999,
                    background: '#eff6ff', color: '#1d4ed8',
                    fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
                  }}
                  onClick={() => handleLoad(f)}
                >
                  <Bookmark size={11} />
                  {f.name}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteSaved(f.name); }}
                    style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', padding: 0, fontSize: '0.85rem', lineHeight: 1 }}
                  >×</button>
                </span>
              ))}

              {!showSaveInput && (
                <button
                  type="button"
                  onClick={() => setShowSaveInput(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 20,
                    border: '1px solid #e2e8f0', background: '#fff',
                    color: '#475569', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Save size={11} /> Сохранить фильтр
                </button>
              )}
            </div>

            {showSaveInput && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  autoFocus
                  style={{
                    padding: '6px 10px', borderRadius: 8,
                    border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#1e293b',
                    width: 180,
                  }}
                  placeholder="Название фильтра"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setShowSaveInput(false); }}
                />
                <button type="button"
                  style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={handleSave}>
                  Сохранить
                </button>
                <button type="button"
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => setShowSaveInput(false)}>
                  Отмена
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
