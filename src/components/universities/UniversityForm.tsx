'use client';

import type { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { UniversityOut, UniversityCreate } from '@/types/api';

interface UniversityFormProps {
  university?: UniversityOut;
  onSubmit: (data: UniversityCreate) => Promise<void>;
  isLoading?: boolean;
}

const universitySchema = z.object({
  // Basic
  name: z.string().min(1, 'Введите название').max(200),
  country: z.string().min(1, 'Введите страну'),
  city: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  website_url: z.string().url('Некорректный URL').or(z.literal('')).optional().nullable(),
  logo_url: z.string().url('Некорректный URL').or(z.literal('')).optional().nullable(),
  cover_image_url: z.string().url('Некорректный URL').or(z.literal('')).optional().nullable(),
  qs_ranking: z.number().min(1).optional().nullable(),
  the_ranking: z.number().min(1).optional().nullable(),
  acceptance_rate: z.number().min(0).max(1).optional().nullable(),
  language_of_instr: z.string().optional().nullable(),
  total_students: z.number().min(0).optional().nullable(),
  international_pct: z.number().min(0).max(100).optional().nullable(),
  is_published: z.boolean().optional(),
  // Dormitory
  dorm_available: z.boolean().optional(),
  dorm_cost_per_month: z.number().min(0).optional().nullable(),
  dorm_cost_currency: z.string().optional().nullable(),
  dorm_guaranteed_for: z.string().optional().nullable(),
  dorm_room_types: z.string().optional().nullable(),
  dorm_image_url: z.string().url('Некорректный URL').or(z.literal('')).optional().nullable(),
  // Campus amenities
  dining_spots_total: z.number().min(0).optional().nullable(),
  cafes_count: z.string().optional().nullable(),
  shops_count: z.string().optional().nullable(),
  parking_count: z.number().min(0).optional().nullable(),
  has_medical_center: z.boolean().optional(),
  has_library: z.boolean().optional(),
  campus_extra: z.string().optional().nullable(),
});

type UniversityFormData = z.infer<typeof universitySchema>;

/* ── Shared styles ── */
const f: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
const lbl: CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: '#475569' };
const inp: CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #e2e8f0', background: '#f8fafc',
  fontSize: '0.875rem', color: '#1e293b', boxSizing: 'border-box',
};
const err: CSSProperties = { fontSize: '0.72rem', color: '#ef4444', marginTop: 2 };
const grid2: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };
const grid3: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 };
const chk: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 };

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 0 6px',
        borderBottom: '2px solid #e8ecf0',
        marginTop: 8,
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{title}</span>
    </div>
  );
}

export function UniversityForm({ university, onSubmit, isLoading = false }: UniversityFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UniversityFormData>({
    resolver: zodResolver(universitySchema),
    mode: 'onChange',
    defaultValues: university
      ? {
          ...university,
          dorm_available: university.dorm_available ?? false,
          has_medical_center: university.has_medical_center ?? false,
          has_library: university.has_library ?? false,
        }
      : { name: '', country: '', is_published: false, dorm_available: false, has_medical_center: false, has_library: false },
  });

  const handleFormSubmit = async (data: UniversityFormData) => {
    try { await onSubmit(data as UniversityCreate); } catch (e) { console.error(e); }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Основное ── */}
      <SectionHeader icon="🏫" title="Основное" />

      <div style={grid2}>
        <div style={f}>
          <label style={lbl}>Название <span style={{ color: '#ef4444' }}>*</span></label>
          <input {...register('name')} type="text" placeholder="Название университета" style={inp} />
          {errors.name && <div style={err}>{errors.name.message}</div>}
        </div>
        <div style={f}>
          <label style={lbl}>Страна <span style={{ color: '#ef4444' }}>*</span></label>
          <input {...register('country')} type="text" placeholder="Kazakhstan" style={inp} />
          {errors.country && <div style={err}>{errors.country.message}</div>}
        </div>
      </div>

      <div style={grid2}>
        <div style={f}>
          <label style={lbl}>Город</label>
          <input {...register('city')} type="text" placeholder="Алматы" style={inp} />
        </div>
        <div style={f}>
          <label style={lbl}>Язык обучения</label>
          <input {...register('language_of_instr')} type="text" placeholder="Английский, Казахский…" style={inp} />
        </div>
      </div>

      <div style={f}>
        <label style={lbl}>Описание</label>
        <textarea {...register('description')} placeholder="Краткое описание университета" style={{ ...inp, minHeight: 72, resize: 'vertical' }} />
      </div>

      <div style={grid2}>
        <div style={f}>
          <label style={lbl}>Веб-сайт</label>
          <input {...register('website_url')} type="url" placeholder="https://example.edu" style={inp} />
          {errors.website_url && <div style={err}>{errors.website_url.message}</div>}
        </div>
        <div style={f}>
          <label style={lbl}>URL логотипа</label>
          <input {...register('logo_url')} type="url" placeholder="https://…" style={inp} />
        </div>
      </div>

      <div style={f}>
        <label style={lbl}>URL обложки</label>
        <input {...register('cover_image_url')} type="url" placeholder="https://…" style={inp} />
      </div>

      {/* ── Статистика ── */}
      <SectionHeader icon="📊" title="Статистика и рейтинги" />

      <div style={grid3}>
        <div style={f}>
          <label style={lbl}>Рейтинг QS</label>
          <input {...register('qs_ranking', { valueAsNumber: true })} type="number" placeholder="напр. 9" min="1" style={inp} />
        </div>
        <div style={f}>
          <label style={lbl}>Рейтинг THE</label>
          <input {...register('the_ranking', { valueAsNumber: true })} type="number" placeholder="напр. 50" min="1" style={inp} />
        </div>
        <div style={f}>
          <label style={lbl}>Процент поступления (0–1)</label>
          <input {...register('acceptance_rate', { valueAsNumber: true })} type="number" placeholder="0.635" min="0" max="1" step="0.001" style={inp} />
        </div>
      </div>

      <div style={grid2}>
        <div style={f}>
          <label style={lbl}>Всего студентов</label>
          <input {...register('total_students', { valueAsNumber: true })} type="number" placeholder="10000" min="0" style={inp} />
        </div>
        <div style={f}>
          <label style={lbl}>Иностранных студентов %</label>
          <input {...register('international_pct', { valueAsNumber: true })} type="number" placeholder="0–100" min="0" max="100" style={inp} />
        </div>
      </div>

      {/* ── Общежитие ── */}
      <SectionHeader icon="🏠" title="Общежитие и проживание" />

      <div style={chk}>
        <input id="dorm_available" type="checkbox" {...register('dorm_available')} style={{ width: 16, height: 16, cursor: 'pointer' }} />
        <label htmlFor="dorm_available" style={{ ...lbl, margin: 0, cursor: 'pointer', fontWeight: 400 }}>
          Общежитие доступно
        </label>
      </div>

      <div style={grid3}>
        <div style={f}>
          <label style={lbl}>Стоимость / месяц</label>
          <input {...register('dorm_cost_per_month', { valueAsNumber: true })} type="number" placeholder="50000" min="0" style={inp} />
        </div>
        <div style={f}>
          <label style={lbl}>Валюта</label>
          <select {...register('dorm_cost_currency')} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">— Выбрать —</option>
            <option value="KZT">KZT (₸)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
        <div style={f}>
          <label style={lbl}>Гарантия места</label>
          <input {...register('dorm_guaranteed_for')} type="text" placeholder="1 курс" style={inp} />
        </div>
      </div>

      <div style={grid2}>
        <div style={f}>
          <label style={lbl}>Типы комнат</label>
          <input {...register('dorm_room_types')} type="text" placeholder="2,3-местные" style={inp} />
        </div>
        <div style={f}>
          <label style={lbl}>Фото общежития (URL)</label>
          <input {...register('dorm_image_url')} type="url" placeholder="https://…" style={inp} />
        </div>
      </div>

      {/* ── Кампус ── */}
      <SectionHeader icon="🍽️" title="Питание и инфраструктура кампуса" />

      <div style={grid3}>
        <div style={f}>
          <label style={lbl}>Мест питания (всего)</label>
          <input {...register('dining_spots_total', { valueAsNumber: true })} type="number" placeholder="15" min="0" style={inp} />
        </div>
        <div style={f}>
          <label style={lbl}>Кафешек (кол-во/диапазон)</label>
          <input {...register('cafes_count')} type="text" placeholder="5-7" style={inp} />
        </div>
        <div style={f}>
          <label style={lbl}>Магазинов</label>
          <input {...register('shops_count')} type="text" placeholder="2-4" style={inp} />
        </div>
      </div>

      <div style={grid3}>
        <div style={f}>
          <label style={lbl}>Парковок</label>
          <input {...register('parking_count', { valueAsNumber: true })} type="number" placeholder="3" min="0" style={inp} />
        </div>
        <div style={{ ...f, gridColumn: 'span 2', flexDirection: 'row', alignItems: 'center', gap: 24, paddingTop: 22 }}>
          <label style={chk}>
            <input type="checkbox" {...register('has_medical_center')} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <span style={{ ...lbl, fontWeight: 400 }}>Медицинский центр</span>
          </label>
          <label style={chk}>
            <input type="checkbox" {...register('has_library')} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <span style={{ ...lbl, fontWeight: 400 }}>Библиотека</span>
          </label>
        </div>
      </div>

      <div style={f}>
        <label style={lbl}>Дополнительно о кампусе</label>
        <textarea
          {...register('campus_extra')}
          placeholder="Спортзал, бассейн, студенческий клуб…"
          style={{ ...inp, minHeight: 60, resize: 'vertical' }}
        />
      </div>

      {/* ── Публикация ── */}
      <SectionHeader icon="⚙️" title="Настройки" />

      <div style={chk}>
        <input id="is_published" type="checkbox" {...register('is_published')} style={{ width: 16, height: 16, cursor: 'pointer' }} />
        <label htmlFor="is_published" style={{ ...lbl, margin: 0, cursor: 'pointer', fontWeight: 400 }}>
          Опубликован (виден студентам)
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
        <button
          type="submit"
          disabled={!isValid || isLoading}
          style={{
            padding: '10px 28px', borderRadius: 10, border: 'none',
            background: !isValid || isLoading ? '#cbd5e1' : '#2563eb',
            color: '#fff', fontWeight: 700, fontSize: '0.9rem',
            cursor: !isValid || isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Сохранение…' : university ? 'Сохранить изменения' : 'Создать университет'}
        </button>
      </div>
    </form>
  );
}
