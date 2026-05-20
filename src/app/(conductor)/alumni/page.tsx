'use client';

import { useState, type CSSProperties } from 'react';
import { useAlumni, useCreateAlumni, useDeleteAlumni, useUpdateAlumni, useUploadAlumniPhoto } from '@/hooks/useAlumni';
import { PageHeader } from '@/components/layout/PageHeader';
import type { AlumniCreate, AlumniOut } from '@/types/api';

// ── Styles ────────────────────────────────────────────────────

const pageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-6)',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: 'var(--space-4)',
};

const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-5)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
};

const formContainerStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
  boxSizing: 'border-box',
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: 100,
};

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  color: 'var(--color-text-primary)',
};

const btnPrimary: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
};

const btnGhost: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 'var(--radius-md)',
  background: 'transparent',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border)',
  cursor: 'pointer',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
};

const btnDanger: CSSProperties = {
  ...btnGhost,
  color: '#dc2626',
  borderColor: '#dc2626',
};

// ── Empty form state ──────────────────────────────────────────

const emptyForm = (): AlumniCreate => ({
  student_name: '',
  story_text: '',
  graduation_year: null,
  university_id: null,
  university_name: '',
  program_name: '',
  scholarship_type: '',
  photo_url: null,
});

// ── Component ─────────────────────────────────────────────────

export default function AlumniPage() {
  const { data: alumniData, isLoading } = useAlumni();
  const createAlumni = useCreateAlumni();
  const deleteAlumni = useDeleteAlumni();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AlumniCreate>(emptyForm());

  const updateAlumni = useUpdateAlumni(editId ?? '');
  const uploadPhoto = useUploadAlumniPhoto(editId ?? '');

  const items: AlumniOut[] = alumniData?.data ?? [];

  function handleOpen() {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function handleEdit(item: AlumniOut) {
    setEditId(item.id);
    setForm({
      student_name: item.student_name,
      story_text: item.story_text ?? '',
      graduation_year: item.graduation_year ?? null,
      university_id: item.university_id ?? null,
      university_name: item.university_name ?? '',
      program_name: item.program_name ?? '',
      scholarship_type: item.scholarship_type ?? '',
      photo_url: item.photo_url ?? null,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editId) {
      await updateAlumni.mutateAsync(form);
    } else {
      await createAlumni.mutateAsync(form);
    }
    setShowForm(false);
    setForm(emptyForm());
    setEditId(null);
  }

  function handleDelete(id: string) {
    if (confirm('Удалить историю?')) {
      deleteAlumni.mutate(id);
    }
  }

  const isPending = createAlumni.isPending || updateAlumni.isPending;

  return (
    <div style={pageStyle}>
      <PageHeader
        title="Истории выпускников"
        subtitle={`${items.length} историй`}
        action={
          <button style={btnPrimary} onClick={handleOpen}>
            + Добавить историю
          </button>
        }
      />

      {showForm && (
        <div style={formContainerStyle}>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
            {editId ? 'Редактировать историю' : 'Новая история'}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <label style={labelStyle}>
                Имя студента *
                <input
                  style={inputStyle}
                  required
                  value={form.student_name}
                  onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                />
              </label>
              <label style={labelStyle}>
                Год выпуска
                <input
                  style={inputStyle}
                  type="number"
                  min={2000}
                  max={2030}
                  value={form.graduation_year ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, graduation_year: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </label>
              <label style={labelStyle}>
                Университет
                <input
                  style={inputStyle}
                  value={form.university_name ?? ''}
                  onChange={(e) => setForm({ ...form, university_name: e.target.value })}
                />
              </label>
              <label style={labelStyle}>
                Программа
                <input
                  style={inputStyle}
                  value={form.program_name ?? ''}
                  onChange={(e) => setForm({ ...form, program_name: e.target.value })}
                />
              </label>
              <label style={labelStyle}>
                Тип стипендии
                <input
                  style={inputStyle}
                  value={form.scholarship_type ?? ''}
                  placeholder="Полная стипендия, Частичная..."
                  onChange={(e) => setForm({ ...form, scholarship_type: e.target.value })}
                />
              </label>
            </div>

            <label style={{ ...labelStyle, marginTop: 'var(--space-4)' }}>
              История *
              <textarea
                style={textareaStyle}
                required
                value={form.story_text}
                onChange={(e) => setForm({ ...form, story_text: e.target.value })}
              />
            </label>

            {editId && (
              <label style={{ ...labelStyle, marginTop: 'var(--space-4)' }}>
                Загрузить фото
                <input
                  type="file"
                  accept="image/*"
                  style={{ fontSize: 'var(--text-sm)' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPhoto.mutate(file);
                  }}
                />
              </label>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
              <button type="submit" style={btnPrimary} disabled={isPending}>
                {isPending ? 'Сохранение...' : editId ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                style={btnGhost}
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                  setForm(emptyForm());
                }}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-8)' }}>
          Загрузка...
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: 48, marginBottom: 'var(--space-3)' }}>🎓</div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Нет историй</div>
          <div style={{ fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Добавьте первую историю успешного выпускника
          </div>
        </div>
      ) : (
        <div style={gridStyle}>
          {items.map((item) => (
            <div key={item.id} style={cardStyle}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                {item.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.photo_url}
                    alt={item.student_name}
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {item.student_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {item.student_name}
                  </div>
                  {item.university_name && (
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      {item.university_name}
                      {item.graduation_year && ` · ${item.graduation_year}`}
                    </div>
                  )}
                  {item.program_name && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {item.program_name}
                    </div>
                  )}
                  {item.scholarship_type && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: 4,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        fontSize: 'var(--text-xs)',
                        fontWeight: 500,
                        background: '#dcfce7',
                        color: '#166534',
                      }}
                    >
                      {item.scholarship_type}
                    </span>
                  )}
                </div>
              </div>

              {item.story_text && (
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  } as CSSProperties}
                >
                  &ldquo;{item.story_text}&rdquo;
                </p>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
                <button style={btnGhost} onClick={() => handleEdit(item)}>
                  Редактировать
                </button>
                <button style={btnDanger} onClick={() => handleDelete(item.id)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
