'use client';

import { type CSSProperties } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Building2,
  KeyRound,
  Server,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { cardStyle, sectionTitleStyle, ADMIN_ACCENT } from '@/components/admin/adminTheme';
import { useAdminStats } from '@/hooks/admin/useAdminStats';
import { useOverviewReport } from '@/hooks/useReports';
import { useUniversities } from '@/hooks/useUniversities';

const ROLE_COLORS = ['#2563eb', '#0ea5e9', ADMIN_ACCENT];

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();
  const overview = useOverviewReport(); // real
  const universities = useUniversities({ page: 1, page_size: 1 }); // real (meta.total)

  const realStudents = overview.data?.total_students;
  const realUniversities = universities.data?.meta?.total;

  const roleData = stats
    ? [
        { name: 'Студенты', value: stats.by_role.student },
        { name: 'Кураторы', value: stats.by_role.adviser },
        { name: 'Админы', value: stats.by_role.admin },
      ]
    : [];

  const quickActions = [
    { label: 'Добавить пользователя', href: '/admin/users', icon: UserPlus },
    { label: 'Кураторы', href: '/admin/advisers', icon: ShieldCheck },
    { label: 'Роли и доступы', href: '/admin/roles', icon: KeyRound },
    { label: 'Настройки системы', href: '/admin/system', icon: Server },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader
        title="Панель администратора"
        subtitle="Обзор пользователей, ролей и состояния системы"
        action={undefined}
      />

      {/* KPI row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <StatCard label="Всего пользователей" value={stats?.total_users ?? '—'} icon={Users} accent={ADMIN_ACCENT} sub="все роли" loading={isLoading} delay={0} />
        <StatCard label="Студенты" value={realStudents ?? stats?.by_role.student ?? '—'} icon={GraduationCap} accent="#2563eb" sub={realStudents != null ? 'данные API' : 'демо'} delay={0.05} />
        <StatCard label="Кураторы" value={stats?.by_role.adviser ?? '—'} icon={ShieldCheck} accent="#0ea5e9" sub="активных команд" loading={isLoading} delay={0.1} />
        <StatCard label="Активные аккаунты" value={stats?.active_users ?? '—'} icon={UserCheck} accent="var(--color-success)" sub={stats ? `из ${stats.total_users}` : ''} loading={isLoading} delay={0.15} />
        <StatCard label="Вузы" value={realUniversities ?? '—'} icon={Building2} accent="var(--color-warning)" sub={realUniversities != null ? 'данные API' : '—'} delay={0.2} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Roles donut */}
        <section style={cardStyle}>
          <h2 style={{ ...sectionTitleStyle, marginBottom: 'var(--space-4)' }}>Распределение по ролям</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div style={{ width: 180, height: 180, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2} stroke="none">
                    {roleData.map((_, i) => (
                      <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stats?.total_users ?? '—'}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>всего</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {roleData.map((r, i) => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: ROLE_COLORS[i % ROLE_COLORS.length] }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                    {r.name}: <strong>{r.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Growth area */}
        <section style={cardStyle}>
          <h2 style={{ ...sectionTitleStyle, marginBottom: 'var(--space-4)' }}>Рост пользователей</h2>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.growth ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ADMIN_ACCENT} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={ADMIN_ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke={ADMIN_ACCENT} strokeWidth={2} fill="url(#adminGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Activity + quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
        <section style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <h2 style={{ ...sectionTitleStyle }}>Недавняя активность</h2>
            <Link href="/admin/system" style={{ fontSize: 'var(--text-sm)', color: ADMIN_ACCENT, textDecoration: 'none', fontWeight: 500 }}>
              Журнал →
            </Link>
          </div>
          <ActivityFeed items={stats?.recent_activity ?? []} />
          {(!stats?.recent_activity || stats.recent_activity.length === 0) && !isLoading && (
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              Журнал аудита доступен в разделе «Система»
            </p>
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={{ ...sectionTitleStyle, marginBottom: 'var(--space-4)' }}>Быстрые действия</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <motion.div key={a.href} whileHover={{ y: -2 }}>
                  <Link href={a.href} style={quickActionStyle}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
                      <Icon size={18} color={ADMIN_ACCENT} />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{a.label}</span>
                    </span>
                    <ArrowRight size={15} color="var(--color-text-disabled)" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

const quickActionStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-2)',
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  textDecoration: 'none',
};
