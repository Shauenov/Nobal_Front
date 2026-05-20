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
  name: z.string().min(1, 'Введите название').max(200, 'Название слишком длинное'),
  country: z.string().min(1, 'Введите страну'),
  city: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  website_url: z.string().url('Некорректный URL').optional().nullable(),
  logo_url: z.string().url('Некорректный URL').optional().nullable(),
  cover_image_url: z.string().url('Некорректный URL').optional().nullable(),
  qs_ranking: z.number().min(1).optional().nullable(),
  the_ranking: z.number().min(1).optional().nullable(),
  acceptance_rate: z.number().min(0).max(1).optional().nullable(),
  language_of_instr: z.string().optional().nullable(),
  total_students: z.number().min(0).optional().nullable(),
  international_pct: z.number().min(0).max(100).optional().nullable(),
  is_published: z.boolean().optional(),
});

type UniversityFormData = z.infer<typeof universitySchema>;

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
};

const fieldStyle: CSSProperties = {
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
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-primary)',
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: '80px',
  resize: 'vertical',
};

const errorStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-error)',
  marginTop: '4px',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 'var(--space-4)',
};

const buttonGroupStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 'var(--space-3)',
  marginTop: 'var(--space-4)',
};

const buttonStyle = (variant: 'primary' | 'ghost', disabled?: boolean): CSSProperties => ({
  padding: '10px 16px',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  border: 'none',
  background: variant === 'primary' ? (disabled ? 'var(--color-border)' : 'var(--color-primary)') : 'transparent',
  color: variant === 'primary' ? '#fff' : 'var(--color-text-primary)',
  opacity: disabled ? 0.6 : 1,
});

const checkboxGroupStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
};

export function UniversityForm({ university, onSubmit, isLoading = false }: UniversityFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UniversityFormData>({
    resolver: zodResolver(universitySchema),
    mode: 'onChange',
    defaultValues: university || {
      name: '',
      country: '',
      is_published: false,
    },
  });

  const handleFormSubmit = async (data: UniversityFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={formStyle}>
      <div style={gridStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Название <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input {...register('name')} type="text" placeholder="Название университета" style={inputStyle} />
          {errors.name && <div style={errorStyle}>{errors.name.message}</div>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>
            Страна <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input {...register('country')} type="text" placeholder="Страна" style={inputStyle} />
          {errors.country && <div style={errorStyle}>{errors.country.message}</div>}
        </div>
      </div>

      <div style={gridStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Город</label>
          <input {...register('city')} type="text" placeholder="Город (необязательно)" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Язык обучения</label>
          <input {...register('language_of_instr')} type="text" placeholder="напр. Английский" style={inputStyle} />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Описание</label>
        <textarea {...register('description')} placeholder="Описание университета" style={textareaStyle} />
      </div>

      <div style={gridStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Веб-сайт</label>
          <input {...register('website_url')} type="url" placeholder="https://..." style={inputStyle} />
          {errors.website_url && <div style={errorStyle}>{errors.website_url.message}</div>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>URL логотипа</label>
          <input {...register('logo_url')} type="url" placeholder="https://..." style={inputStyle} />
          {errors.logo_url && <div style={errorStyle}>{errors.logo_url.message}</div>}
        </div>
      </div>

      <div style={gridStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>URL обложки</label>
          <input {...register('cover_image_url')} type="url" placeholder="https://..." style={inputStyle} />
          {errors.cover_image_url && <div style={errorStyle}>{errors.cover_image_url.message}</div>}
        </div>

        <div style={fieldStyle} />
      </div>

      <div style={gridStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Рейтинг QS</label>
          <input {...register('qs_ranking', { valueAsNumber: true })} type="number" placeholder="напр. 1" min="1" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Рейтинг THE</label>
          <input {...register('the_ranking', { valueAsNumber: true })} type="number" placeholder="напр. 1" min="1" style={inputStyle} />
        </div>
      </div>

      <div style={gridStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Процент поступления (0–1)</label>
          <input {...register('acceptance_rate', { valueAsNumber: true })} type="number" placeholder="0.0–1.0" min="0" max="1" step="0.01" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Всего студентов</label>
          <input {...register('total_students', { valueAsNumber: true })} type="number" placeholder="напр. 10000" min="0" style={inputStyle} />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Иностранные студенты %</label>
        <input
          {...register('international_pct', { valueAsNumber: true })}
          type="number"
          placeholder="0–100"
          min="0"
          max="100"
          style={inputStyle}
        />
      </div>

      <div style={checkboxGroupStyle}>
        <input type="checkbox" id="is_published" {...register('is_published')} style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
        <label htmlFor="is_published" style={{ ...labelStyle, margin: 0, cursor: 'pointer', fontWeight: 'normal' }}>
          Опубликован
        </label>
      </div>

      <div style={buttonGroupStyle}>
        <button type="submit" style={buttonStyle('primary', !isValid || isLoading)} disabled={!isValid || isLoading}>
          {isLoading ? 'Сохранение...' : university ? 'Обновить' : 'Создать'}
        </button>
      </div>
    </form>
  );
}
