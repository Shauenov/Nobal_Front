'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import {
  useUniversity,
  useUpdateUniversity,
  useCreateProgram,
  useDeleteProgram,
  useUploadLogo,
  useUploadCover,
} from '@/hooks/useUniversities';
import { useUniversityEnrollments, useUpdateEnrollment } from '@/hooks/useEnrollments';
import { PageHeader } from '@/components/layout/PageHeader';
import { UniversityForm } from '@/components/universities/UniversityForm';
import { ImageUpload } from '@/components/ui/ImageUpload';
import type { EnrollmentStatus, EnrollmentWithStudentOut, UniversityCreate, UniversityOut } from '@/types/api';

/* ─────────────────────────────────────────── Styles ── */

const tabButtonStyle = (isActive: boolean): CSSProperties => ({
  padding: '12px 16px',
  borderRadius: '4px 4px 0 0',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  cursor: 'pointer',
  border: 'none',
  background: isActive ? 'var(--color-primary)' : 'transparent',
  color: isActive ? '#fff' : 'var(--color-text-secondary)',
  borderBottom: isActive ? 'none' : '2px solid transparent',
});

const containerStyle: CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  padding: 'var(--space-6)',
};

const buttonStyle = (variant: 'primary' | 'ghost' = 'ghost', disabled?: boolean): CSSProperties => ({
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  border: variant === 'primary' ? 'none' : '1px solid var(--color-border)',
  background: variant === 'primary' ? 'var(--color-primary)' : 'transparent',
  color: variant === 'primary' ? '#fff' : 'var(--color-text-primary)',
  opacity: disabled ? 0.6 : 1,
});

const statusColors: Record<EnrollmentStatus, { bg: string; color: string; label: string }> = {
  selected:  { bg: '#e0f2fe', color: '#0369a1', label: 'Выбран'  },
  applying:  { bg: '#fef9c3', color: '#a16207', label: 'Подаёт'  },
  submitted: { bg: '#ede9fe', color: '#6d28d9', label: 'Подано'  },
  accepted:  { bg: '#dcfce7', color: '#166534', label: 'Принят'  },
  rejected:  { bg: '#fee2e2', color: '#991b1b', label: 'Отказано'},
};

const ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  'selected', 'applying', 'submitted', 'accepted', 'rejected',
];

/* ─────────────────────────────────────────── Preview ── */

function StatChip({
  icon,
  label,
  value,
  sub,
  badge,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  badge?: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e8ecf0',
        borderRadius: 14,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        {badge && (
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: '#6366f1',
              background: '#eef2ff',
              borderRadius: 6,
              padding: '2px 7px',
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{sub}</div>}
    </div>
  );
}

function UniversityPreview({
  university,
  programs,
}: {
  university: UniversityOut;
  programs: { id: string; name: string; degree_level?: string | null; field?: string | null; tuition_usd?: number | null; min_gpa?: number | null; min_ielts?: number | null }[];
}) {
  const [logoError, setLogoError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const acceptancePct =
    university.acceptance_rate != null ? `${Math.round(Number(university.acceptance_rate) * 100)}%` : '—';
  const intlPct =
    university.international_pct != null ? `${Math.round(Number(university.international_pct) * 100)}%` : '—';
  const students =
    university.total_students != null
      ? university.total_students >= 1000
        ? `${(university.total_students / 1000).toFixed(0)}k`
        : String(university.total_students)
      : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid #e8ecf0', boxShadow: '0 2px 12px rgba(15,23,42,0.07)' }}>

      {/* ── Hero banner ── */}
      <div
        style={{
          height: 220,
          background: 'linear-gradient(135deg,#1e3a5f 0%,#2d5a8e 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {university.cover_image_url && !coverError && (
          <Image
            src={university.cover_image_url}
            alt={university.name}
            fill
            unoptimized
            style={{ objectFit: 'cover' }}
            onError={() => setCoverError(true)}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.62) 100%)' }} />

        {/* Logo + name + location row */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            {university.logo_url && !logoError ? (
              <Image
                src={university.logo_url}
                alt={university.name}
                width={64}
                height={64}
                unoptimized
                style={{ objectFit: 'contain' }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <span style={{ fontSize: '1.8rem' }}>🏫</span>
            )}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.5)', lineHeight: 1.2 }}>
              {university.name}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
              {[university.city, university.country].filter(Boolean).join(', ') && (
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>
                  📍 {[university.city, university.country].filter(Boolean).join(', ')}
                </span>
              )}
              {university.website_url && (
                <a
                  href={university.website_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}
                >
                  🌐 {university.website_url.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div
        style={{
          background: '#f8fafc',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
        }}
      >
        <StatChip
          icon="📈"
          label="Уровень приёма"
          value={acceptancePct}
          sub="Успешных поступлений"
          badge={university.acceptance_rate ? `+${Math.round(Number(university.acceptance_rate) * 100)}%` : undefined}
        />
        <StatChip
          icon="👥"
          label="Студентов"
          value={students}
          sub={university.total_students ? '84% закончили обучение' : undefined}
        />
        <StatChip
          icon="⭐"
          label="QS Рейтинг"
          value={university.qs_ranking ? `#${university.qs_ranking}` : '—'}
          sub={university.the_ranking ? `THE: #${university.the_ranking}` : undefined}
          badge={university.qs_ranking && university.qs_ranking <= 10 ? 'Top 10' : university.qs_ranking && university.qs_ranking <= 100 ? 'Top 100' : undefined}
        />
        <StatChip
          icon="🌍"
          label="Международных"
          value={intlPct}
          sub={university.language_of_instr ? `Язык: ${university.language_of_instr}` : undefined}
        />
      </div>

      {/* ── Description ── */}
      {university.description && (
        <div style={{ padding: '16px 20px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Об университете
          </div>
          <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, lineHeight: 1.65 }}>
            {university.description}
          </p>
        </div>
      )}

      {/* ── Dormitory ── */}
      {university.dorm_available && (
        <div style={{ padding: '16px 20px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: '1.2rem' }}>🏠</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Общежитие и проживание</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: university.dorm_image_url ? '1fr 1fr' : '1fr', gap: 20, alignItems: 'start' }}>
            {university.dorm_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={university.dorm_image_url}
                alt="Общежитие"
                style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10 }}
              />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Стоимость (мес)', university.dorm_cost_per_month != null
                  ? `от ${university.dorm_cost_per_month.toLocaleString()} ${university.dorm_cost_currency ?? ''}`
                  : null],
                ['Гарантия места', university.dorm_guaranteed_for],
                ['Типы комнат', university.dorm_room_types],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{label as string}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Campus amenities ── */}
      {(university.dining_spots_total != null || university.cafes_count || university.shops_count ||
        university.parking_count != null || university.has_medical_center || university.has_library || university.campus_extra) && (
        <div style={{ padding: '16px 20px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: '1.2rem' }}>🍽️</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Питание и инфраструктура</span>
            {university.dining_spots_total != null && (
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', background: '#f0fdf4', color: '#15803d', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>
                {university.dining_spots_total} ТОЧЕК
              </span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            {university.cafes_count && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e8ecf0' }}>
                <span style={{ fontSize: '1rem' }}>☕</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{university.cafes_count} Кафешек</div>
                </div>
              </div>
            )}
            {university.shops_count && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e8ecf0' }}>
                <span style={{ fontSize: '1rem' }}>🛒</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{university.shops_count} Магазинов</div>
                </div>
              </div>
            )}
            {university.parking_count != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e8ecf0' }}>
                <span style={{ fontSize: '1rem' }}>🅿️</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{university.parking_count} Парковок</div>
                </div>
              </div>
            )}
            {university.has_medical_center && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e8ecf0' }}>
                <span style={{ fontSize: '1rem' }}>🏥</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>Медицинский центр</div>
              </div>
            )}
            {university.has_library && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e8ecf0' }}>
                <span style={{ fontSize: '1rem' }}>📚</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>Библиотека</div>
              </div>
            )}
          </div>
          {university.campus_extra && (
            <p style={{ marginTop: 12, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, margin: '12px 0 0' }}>
              {university.campus_extra}
            </p>
          )}
        </div>
      )}

      {/* ── Programs ── */}
      {programs.length > 0 && (
        <div style={{ padding: '16px 20px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Программы ({programs.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {programs.map((p) => (
              <div key={p.id} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e8ecf0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>{p.name}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                  {p.degree_level && (
                    <span style={{ fontSize: '0.68rem', background: '#eff6ff', color: '#2563eb', borderRadius: 6, padding: '1px 7px', fontWeight: 500 }}>
                      {p.degree_level}
                    </span>
                  )}
                  {p.field && (
                    <span style={{ fontSize: '0.68rem', background: '#f0fdf4', color: '#166534', borderRadius: 6, padding: '1px 7px', fontWeight: 500 }}>
                      {p.field}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                  {p.tuition_usd != null && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>💰 ${p.tuition_usd.toLocaleString()}/год</span>}
                  {p.min_gpa != null && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>GPA ≥ {p.min_gpa}</span>}
                  {p.min_ielts != null && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>IELTS ≥ {p.min_ielts}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── Page ── */

export default function UniversityDetailPage() {
  const params = useParams();
  const universityId = params.universityId as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'enrollments'>('overview');
  const [overviewMode, setOverviewMode] = useState<'preview' | 'edit'>('preview');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<string>('');

  const { data: universityDetail, isLoading } = useUniversity(universityId);
  const setPageTitle = useUIStore((s) => s.setPageTitle);

  useEffect(() => {
    if (universityDetail?.university?.name) {
      setPageTitle(universityDetail.university.name);
    }
    return () => setPageTitle(null);
  }, [universityDetail?.university?.name, setPageTitle]);

  const updateUniversity = useUpdateUniversity(universityId);
  const uploadLogo    = useUploadLogo(universityId);
  const uploadCover   = useUploadCover(universityId);
  const createProgram = useCreateProgram(universityId);
  const deleteProgram = useDeleteProgram(universityId);

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useUniversityEnrollments(
    universityId,
    enrollmentStatusFilter ? { status: enrollmentStatusFilter } : undefined
  );
  const updateEnrollment = useUpdateEnrollment();

  const university = useMemo(() => universityDetail?.university, [universityDetail?.university]);
  const programs   = useMemo(() => universityDetail?.programs ?? [],  [universityDetail?.programs]);

  const handleUpdateUniversity = useCallback(
    async (data: UniversityCreate) => {
      try { await updateUniversity.mutateAsync(data); } catch (e) { console.error(e); }
    },
    [updateUniversity]
  );

  const handleCreateProgram = useCallback(async () => {
    const name = prompt('Название программы:');
    if (!name) return;
    try { await createProgram.mutateAsync({ name, is_active: true }); } catch (e) { console.error(e); }
  }, [createProgram]);

  const handleDeleteProgram = useCallback(
    (programId: string) => {
      if (confirm('Удалить эту программу?')) deleteProgram.mutate(programId);
    },
    [deleteProgram]
  );

  if (isLoading || !university) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Загрузка...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title={university.name}
        subtitle={`${university.city ? university.city + ', ' : ''}${university.country}`}
      />

      {/* ── Main tabs ── */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)' }}>
        {[
          { id: 'overview',     label: 'Обзор' },
          { id: 'programs',     label: `Программы (${programs.length})` },
          { id: 'enrollments',  label: `Заявки ${enrollmentsData ? `(${enrollmentsData.meta.total})` : '(0)'}` },
        ].map((tab) => (
          <button
            key={tab.id}
            style={tabButtonStyle(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ ОБЗОР ══ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Sub-tabs: Превью / Редактировать */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              background: '#f1f5f9',
              borderRadius: 10,
              padding: 4,
              width: 'fit-content',
            }}
          >
            {[
              { id: 'preview', label: '👁 Превью' },
              { id: 'edit',    label: '✏️ Редактировать' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setOverviewMode(m.id as 'preview' | 'edit')}
                style={{
                  padding: '7px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: overviewMode === m.id ? '#fff' : 'transparent',
                  color: overviewMode === m.id ? '#1e293b' : '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: overviewMode === m.id ? 600 : 400,
                  cursor: 'pointer',
                  boxShadow: overviewMode === m.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 150ms ease',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {overviewMode === 'preview' ? (
            <UniversityPreview university={university} programs={programs} />
          ) : (
            <div style={containerStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <ImageUpload
                  currentImageUrl={university.logo_url}
                  onUpload={async (file) => { await uploadLogo.mutateAsync(file); }}
                  isUploading={uploadLogo.isPending}
                  label="Логотип университета"
                />
                <ImageUpload
                  currentImageUrl={university.cover_image_url}
                  onUpload={async (file) => { await uploadCover.mutateAsync(file); }}
                  isUploading={uploadCover.isPending}
                  label="Обложка университета"
                />
              </div>
              <UniversityForm
                university={university}
                onSubmit={handleUpdateUniversity}
                isLoading={updateUniversity.isPending}
              />
            </div>
          )}
        </div>
      )}

      {/* ══ ПРОГРАММЫ ══ */}
      {activeTab === 'programs' && (
        <div style={containerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>Программы</div>
            <button style={buttonStyle('primary')} onClick={handleCreateProgram} disabled={createProgram.isPending}>
              + Добавить программу
            </button>
          </div>

          {programs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-6)' }}>
              Пока нет программ. Нажмите «Добавить программу», чтобы создать.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
              {programs.map((program) => (
                <div
                  key={program.id}
                  style={{
                    background: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                  }}
                >
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
                    {program.name}
                  </div>
                  {program.degree_level && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Степень: {program.degree_level}</div>}
                  {program.field && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Направление: {program.field}</div>}
                  {program.tuition_usd != null && (
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Стоимость: ${program.tuition_usd.toLocaleString()}</div>
                  )}
                  {program.min_gpa != null && (
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Мин. GPA: {program.min_gpa}</div>
                  )}
                  {program.min_ielts != null && (
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Мин. IELTS: {program.min_ielts}</div>
                  )}
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <button style={buttonStyle()} disabled={deleteProgram.isPending}>Изменить</button>
                    <button style={buttonStyle()} onClick={() => handleDeleteProgram(program.id)} disabled={deleteProgram.isPending}>
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ ЗАЯВКИ ══ */}
      {activeTab === 'enrollments' && (
        <div style={containerStyle}>
          {/* Status filter */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Статус:</span>
            <button
              style={{ ...buttonStyle(enrollmentStatusFilter === '' ? 'primary' : 'ghost'), fontSize: 'var(--text-xs)' }}
              onClick={() => setEnrollmentStatusFilter('')}
            >
              Все
            </button>
            {ENROLLMENT_STATUSES.map((s) => (
              <button
                key={s}
                style={{ ...buttonStyle(enrollmentStatusFilter === s ? 'primary' : 'ghost'), fontSize: 'var(--text-xs)' }}
                onClick={() => setEnrollmentStatusFilter(s)}
              >
                {statusColors[s].label}
              </button>
            ))}
          </div>

          {enrollmentsLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>Загрузка...</div>
          ) : !enrollmentsData?.data.length ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>Нет заявок</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Студент', 'Статус', 'Прогресс', 'Дата', 'Действие'].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enrollmentsData.data.map((enrollment: EnrollmentWithStudentOut) => {
                  const sc = statusColors[enrollment.status as EnrollmentStatus] ?? statusColors.selected;
                  return (
                    <tr key={enrollment.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {enrollment.student.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={enrollment.student.avatar_url} alt={enrollment.student.full_name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)' }}>
                              {enrollment.student.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                            {enrollment.student.full_name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', background: sc.bg, color: sc.color }}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${enrollment.progress}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', width: 30 }}>
                            {enrollment.progress}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        {new Date(enrollment.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <select
                          style={{ fontSize: 'var(--text-xs)', padding: '4px 6px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', color: 'var(--color-text-primary)', cursor: 'pointer' }}
                          value={enrollment.status}
                          disabled={updateEnrollment.isPending}
                          onChange={(e) =>
                            updateEnrollment.mutate({
                              studentId: enrollment.student_id,
                              universityId,
                              data: { status: e.target.value as EnrollmentStatus },
                            })
                          }
                        >
                          {ENROLLMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{statusColors[s].label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {enrollmentsData && enrollmentsData.meta.total > enrollmentsData.data.length && (
            <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              Показано {enrollmentsData.data.length} из {enrollmentsData.meta.total}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
