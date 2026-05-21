'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { useStudentProfile, useUpdateStudentProfile } from '@/hooks/useProfile';
import type { ProfileUpdate } from '@/types/api';

/* ─── Helpers ─── */
const getStudentId = (v: string | string[] | undefined) =>
  Array.isArray(v) ? (v[0] ?? '') : (v ?? '');

const toNullableNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/* ─── Shared styles ─── */
const card: CSSProperties = {
  background: '#fff',
  border: '1px solid #e8ecf0',
  borderRadius: 14,
  padding: '20px 22px',
  boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
};

const sectionTitle: CSSProperties = {
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 18,
};

const label: CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 5,
  display: 'block',
};

const input: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 9,
  border: '1px solid #e2e8f0',
  fontSize: '0.875rem',
  color: '#1e293b',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

const grid2: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 14,
};

const toggleRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #e8ecf0',
  background: '#fafbfc',
};

/* ─── Toggle switch ─── */
function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <label htmlFor={id} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: checked ? '#2563eb' : '#e2e8f0',
          position: 'relative',
          transition: 'background 200ms',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 21 : 3,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 200ms',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        />
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
        />
      </div>
    </label>
  );
}

/* ─── Target countries chip input ─── */
function CountriesInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const t = draft.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {value.map((c) => (
            <span
              key={c}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 10px',
                borderRadius: 9999,
                background: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '0.78rem',
                fontWeight: 500,
              }}
            >
              {c}
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== c))}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: 0, lineHeight: 1, fontSize: '1rem' }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ ...input, flex: 1 }}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="США, Германия, Нидерланды…"
        />
        <button
          type="button"
          onClick={add}
          style={{
            padding: '8px 14px',
            borderRadius: 9,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function StudentProfilePage() {
  const params = useParams();
  const studentId = getStudentId(params.studentId);
  const profileQuery = useStudentProfile(studentId);
  const updateProfile = useUpdateStudentProfile(studentId);

  const [localCountries, setLocalCountries] = useState<string[] | undefined>(undefined);
  const targetCountries = localCountries ?? profileQuery.data?.target_countries ?? [];

  const { register, handleSubmit, reset, watch, setValue } = useForm<ProfileUpdate>({ defaultValues: {} });
  const ieltsChecked = (watch('ielts_passed') as boolean | undefined) ?? false;
  const satChecked   = (watch('sat_passed')   as boolean | undefined) ?? false;

  useEffect(() => {
    if (profileQuery.data) {
      const p = profileQuery.data;
      reset({
        group_type:   p.group_type ?? 'D',
        course_year:  p.course_year ?? 2,
        gpa:          p.gpa ? Number(p.gpa) : null,
        ielts_passed: p.ielts_passed ?? false,
        ielts_score:  p.ielts_score ? Number(p.ielts_score) : null,
        sat_passed:   p.sat_passed ?? false,
        sat_score:    p.sat_score ?? null,
        target_country: p.target_country ?? null,
        target_major:   p.target_major ?? null,
        notes:          p.notes ?? null,
        school_name:    p.school_name ?? null,
        degree_level:   p.degree_level ?? null,
        budget_max:     p.budget_max ?? null,
        phone:          p.phone ?? null,
      });
    }
  }, [profileQuery.data, reset]);

  if (profileQuery.isLoading) {
    return <div style={{ color: '#94a3b8', padding: 20 }}>Загрузка профиля...</div>;
  }

  if (!profileQuery.data) {
    return <div style={{ color: '#94a3b8', padding: 20 }}>Профиль недоступен.</div>;
  }

  const onSubmit = handleSubmit((values) => {
    updateProfile.mutate({
      group_type:    values.group_type ?? null,
      course_year:   toNullableNumber(values.course_year),
      gpa:           toNullableNumber(values.gpa),
      ielts_passed:  ieltsChecked,
      ielts_score:   toNullableNumber(values.ielts_score),
      sat_passed:    satChecked,
      sat_score:     toNullableNumber(values.sat_score),
      target_country: values.target_country ?? null,
      target_major:   values.target_major ?? null,
      notes:          values.notes ?? null,
      school_name:    values.school_name ?? null,
      degree_level:   values.degree_level ?? null,
      budget_max:     toNullableNumber(values.budget_max),
      phone:          values.phone ?? null,
      target_countries: targetCountries.length > 0 ? targetCountries : null,
    });
  });

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Academic data ── */}
      <div style={card}>
        <div style={sectionTitle}>Академические данные</div>
        <div style={grid2}>
          <div>
            <span style={label}>Группа</span>
            <select style={input} {...register('group_type')}>
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
          <div>
            <span style={label}>Курс</span>
            <select style={input} {...register('course_year')}>
              <option value={2}>2-й курс</option>
              <option value={3}>3-й курс</option>
            </select>
          </div>
          <div>
            <span style={label}>GPA</span>
            <input type="number" step="0.01" min={0} max={4} style={input} {...register('gpa')} />
          </div>
          <div>
            <span style={label}>Школа</span>
            <input style={input} {...register('school_name')} placeholder="Название школы" />
          </div>
          <div>
            <span style={label}>Степень</span>
            <select style={input} {...register('degree_level')}>
              <option value="">— Не указано —</option>
              <option value="bachelor">Бакалавр</option>
              <option value="master">Магистр</option>
              <option value="phd">PhD</option>
              <option value="foundation">Foundation</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Tests ── */}
      <div style={card}>
        <div style={sectionTitle}>Тесты</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* IELTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={toggleRow}>
              <Toggle id="ielts-toggle" checked={ieltsChecked} onChange={(v) => setValue('ielts_passed', v)} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>IELTS сдан</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{ieltsChecked ? 'Да' : 'Нет'}</div>
              </div>
            </div>
            <div>
              <span style={label}>Балл IELTS</span>
              <input type="number" step="0.5" min={0} max={9} style={input} {...register('ielts_score')} />
            </div>
          </div>
          {/* SAT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={toggleRow}>
              <Toggle id="sat-toggle" checked={satChecked} onChange={(v) => setValue('sat_passed', v)} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>SAT сдан</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{satChecked ? 'Да' : 'Нет'}</div>
              </div>
            </div>
            <div>
              <span style={label}>Балл SAT</span>
              <input type="number" min={400} max={1600} style={input} {...register('sat_score')} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Admission goals ── */}
      <div style={card}>
        <div style={sectionTitle}>Цели поступления</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <span style={label}>Целевые страны</span>
            <CountriesInput value={targetCountries as string[]} onChange={setLocalCountries} />
          </div>
          <div style={grid2}>
            <div>
              <span style={label}>Специальность</span>
              <input style={input} {...register('target_major')} placeholder="Информатика" />
            </div>
            <div>
              <span style={label}>Бюджет (USD)</span>
              <input type="number" min={0} style={input} {...register('budget_max')} placeholder="50 000" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Contacts & notes ── */}
      <div style={card}>
        <div style={sectionTitle}>Контакты и заметки</div>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <span style={label}>Телефон</span>
            <input style={input} {...register('phone')} placeholder="+7 XXX XXX XXXX" />
          </div>
          <div>
            <span style={label}>Заметки</span>
            <textarea
              rows={4}
              style={{ ...input, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
              {...register('notes')}
            />
          </div>
        </div>
      </div>

      {/* ── Save button ── */}
      <div>
        <button
          type="submit"
          disabled={updateProfile.isPending}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 22px',
            borderRadius: 9,
            border: 'none',
            background: updateProfile.isPending ? '#93c5fd' : '#2563eb',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: updateProfile.isPending ? 'not-allowed' : 'pointer',
            transition: 'background 150ms',
          }}
        >
          {updateProfile.isPending ? 'Сохранение…' : 'Сохранить изменения'}
        </button>
      </div>
    </form>
  );
}
