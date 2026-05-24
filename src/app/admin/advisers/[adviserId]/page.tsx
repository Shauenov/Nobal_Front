'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, BookOpen, MessageSquare, Mail, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/admin/StatCard';
import { StatusPill } from '@/components/admin/StatusPill';
import { cardStyle, sectionTitleStyle, ADMIN_ACCENT } from '@/components/admin/adminTheme';
import { useAdviserProfile, useAdviserReviews } from '@/hooks/admin/useAdminAdvisers';

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
}

export default function AdminAdviserDetailPage() {
  const { adviserId } = useParams<{ adviserId: string }>();
  const router = useRouter();

  const { data: profile, isLoading: profileLoading } = useAdviserProfile(adviserId);
  const { data: reviewsData, isLoading: reviewsLoading } = useAdviserReviews(adviserId);

  const reviews = reviewsData?.data ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <button
        onClick={() => router.push('/admin/advisers')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 'var(--text-sm)', width: 'fit-content' }}
      >
        <ArrowLeft size={16} /> К списку кураторов
      </button>

      {profileLoading ? (
        <>
          <Skeleton style={{ height: 140, borderRadius: 12 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} style={{ height: 100, borderRadius: 12 }} />)}
          </div>
        </>
      ) : !profile ? (
        <EmptyState title="Куратор не найден" description="Возможно, запись была удалена" icon={<BookOpen size={24} />} />
      ) : (
        <>
          <PageHeader
            title={profile.full_name}
            subtitle={profile.headline ?? 'Куратор'}
          />

          {/* Profile card */}
          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
            <span
              style={{
                width: 72,
                height: 72,
                borderRadius: 'var(--radius-full)',
                background: `color-mix(in srgb, ${ADMIN_ACCENT} 14%, transparent)`,
                color: ADMIN_ACCENT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials(profile.full_name)
              )}
            </span>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 6 }}>
                <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 600 }}>{profile.full_name}</h2>
                <StatusPill active={true} />
              </div>
              {profile.headline && (
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 4 }}>{profile.headline}</div>
              )}
              {profile.bio && (
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{profile.bio}</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={22} color="#f59e0b" fill="#f59e0b" />
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{profile.rating_avg.toFixed(1)}</span>
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{profile.reviews_count} отзывов</span>
            </div>
          </div>

          {/* Skills */}
          {profile.skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: `color-mix(in srgb, ${ADMIN_ACCENT} 10%, transparent)`,
                    color: ADMIN_ACCENT,
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    border: `1px solid color-mix(in srgb, ${ADMIN_ACCENT} 25%, transparent)`,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
            <StatCard label="Студентов размещено" value={profile.students_placed ?? 0} icon={BookOpen} accent={ADMIN_ACCENT} />
            <StatCard label="Отзывов" value={profile.reviews_count} icon={MessageSquare} accent="#0ea5e9" delay={0.05} />
            <StatCard label="Рейтинг" value={profile.rating_avg.toFixed(1)} icon={Star} accent="#f59e0b" delay={0.1} />
            {profile.years_experience != null && (
              <StatCard label="Лет опыта" value={profile.years_experience} icon={Clock} accent="var(--color-success)" delay={0.15} />
            )}
          </div>

          {/* Reviews */}
          <section style={cardStyle}>
            <h2 style={{ ...sectionTitleStyle, marginBottom: 'var(--space-4)' }}>
              Отзывы студентов
            </h2>
            {reviewsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} style={{ height: 70, borderRadius: 8 }} />)}
              </div>
            ) : reviews.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>Отзывов пока нет</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {reviews.map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      padding: 'var(--space-3) 0',
                      borderBottom: i < reviews.length - 1 ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ fontSize: 'var(--text-sm)' }}>{r.author_name ?? 'Аноним'}</strong>
                      <span style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={13} color="#f59e0b" fill={j < r.rating ? '#f59e0b' : 'none'} />
                        ))}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{r.text ?? ''}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
