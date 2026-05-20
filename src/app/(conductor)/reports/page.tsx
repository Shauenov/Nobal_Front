'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useReports } from '@/hooks/useReports';
import { exportCsv } from '@/lib/exportCsv';
import type { OverviewReport, StudentProgressItem, UniversityStats } from '@/types/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-6)',
};

const tabsStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-2)',
  borderBottom: '1px solid var(--color-border)',
  paddingBottom: 'var(--space-3)',
};

const tabButtonStyle = (active: boolean): CSSProperties => ({
  padding: 'var(--space-2) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  background: active ? 'var(--color-primary)' : 'transparent',
  color: active ? 'white' : 'var(--color-text-secondary)',
  cursor: 'pointer',
  fontSize: 'var(--text-sm)',
  fontWeight: active ? '600' : '500',
  transition: 'all 150ms ease',
});

const sectionStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
  boxShadow: 'var(--shadow-sm)',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 'var(--space-4)',
  marginBottom: 'var(--space-6)',
};

const cardStyle: CSSProperties = {
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'white',
};

const cardTitleStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  fontWeight: '600',
  color: 'var(--color-text-secondary)',
  marginBottom: 'var(--space-2)',
  textTransform: 'uppercase',
};

const cardValueStyle: CSSProperties = {
  fontSize: 'var(--text-2xl)',
  fontWeight: '700',
  color: 'var(--color-text-primary)',
};

const chartContainerStyle: CSSProperties = {
  height: 300,
  marginBottom: 'var(--space-4)',
};

export default function ReportsPage() {
  const { data: reports } = useReports();
  const [activeTab, setActiveTab] = useState('overview');

  const overviewReport = (reports?.overview || {}) as OverviewReport;
  const studentsReport = (reports?.students || []) as StudentProgressItem[];
  const universitiesReport = (reports?.universities || {}) as UniversityStats;

  return (
    <div style={containerStyle}>
      <PageHeader
        title="Отчёты"
        subtitle="Аналитика и статистика по студентам"
      />

      <div style={tabsStyle}>
        <button
          style={tabButtonStyle(activeTab === 'overview')}
          onClick={() => setActiveTab('overview')}
        >
          Обзор
        </button>
        <button
          style={tabButtonStyle(activeTab === 'students')}
          onClick={() => setActiveTab('students')}
        >
          Студенты
        </button>
        <button
          style={tabButtonStyle(activeTab === 'universities')}
          onClick={() => setActiveTab('universities')}
        >
          Университеты
        </button>
      </div>

      {activeTab === 'overview' && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600' }}>Общая статистика</h2>
            <button
              type="button"
              onClick={() => exportCsv([{
                'Всего студентов': overviewReport.total_students ?? 0,
                'IELTS сдали': overviewReport.ielts_passed ?? 0,
                'SAT сдали': overviewReport.sat_passed ?? 0,
                'Средний GPA': (overviewReport.avg_gpa ?? 0).toFixed(2),
              }], 'отчёт-обзор')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <Download size={13} /> Экспорт CSV
            </button>
          </div>

          <div style={gridStyle}>
            <div style={cardStyle}>
              <div style={cardTitleStyle}>Всего студентов</div>
              <div style={cardValueStyle}>{overviewReport.total_students || 0}</div>
            </div>
            <div style={cardStyle}>
              <div style={cardTitleStyle}>IELTS сдали</div>
              <div style={cardValueStyle}>{overviewReport.ielts_passed || 0}</div>
            </div>
            <div style={cardStyle}>
              <div style={cardTitleStyle}>SAT сдали</div>
              <div style={cardValueStyle}>{overviewReport.sat_passed || 0}</div>
            </div>
            <div style={cardStyle}>
              <div style={cardTitleStyle}>Средний GPA</div>
              <div style={cardValueStyle}>{(overviewReport.avg_gpa || 0).toFixed(2)}</div>
            </div>
          </div>

          {overviewReport.by_group && Object.keys(overviewReport.by_group).length > 0 && (
            <div>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: '600', marginBottom: 'var(--space-3)' }}>
                Распределение по группам
              </h3>
              <div style={chartContainerStyle}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(overviewReport.by_group).map(([key, value]) => ({
                        name: key,
                        value: value as number,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="var(--color-primary)" />
                      <Cell fill="var(--color-border)" />
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600' }}>Прогресс студентов</h2>
            <button
              type="button"
              disabled={studentsReport.length === 0}
              onClick={() => exportCsv(studentsReport.map((s) => ({
                'Имя': s.full_name,
                'Группа': s.group_type ?? '',
                'Курс': s.course_year ?? '',
                'GPA': s.gpa ?? '',
                'IELTS': s.ielts_passed ? 'Да' : 'Нет',
                'SAT': s.sat_passed ? 'Да' : 'Нет',
                'Задания (всего)': s.tasks_total,
                'Выполнено': s.tasks_done,
                'Просрочено': s.tasks_overdue,
              })), 'отчёт-студенты')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '0.8rem', fontWeight: 600, cursor: studentsReport.length ? 'pointer' : 'not-allowed', opacity: studentsReport.length ? 1 : 0.5 }}
            >
              <Download size={13} /> Экспорт CSV
            </button>
          </div>
          {studentsReport.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>Нет данных</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    {['Студент', 'Группа', 'GPA', 'IELTS', 'SAT', 'Задания', 'Выполнено', 'Просрочено'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 12px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: 'var(--color-text-secondary)',
                          whiteSpace: 'nowrap',
                          fontSize: 'var(--text-xs)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studentsReport.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{s.full_name}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>
                        {s.group_type ?? '—'}
                        {s.course_year != null && ` · ${s.course_year} кур.`}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {s.gpa != null ? (
                          <span style={{ fontWeight: 600, color: s.gpa >= 3.5 ? '#16a34a' : s.gpa >= 2.5 ? '#ca8a04' : '#dc2626' }}>
                            {s.gpa.toFixed(2)}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {s.ielts_passed
                          ? <span style={{ color: '#16a34a', fontWeight: 600 }}>✓</span>
                          : <span style={{ color: '#9ca3af' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {s.sat_passed
                          ? <span style={{ color: '#16a34a', fontWeight: 600 }}>✓</span>
                          : <span style={{ color: '#9ca3af' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{s.tasks_total}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>{s.tasks_done}</span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {s.tasks_overdue > 0
                          ? <span style={{ color: '#dc2626', fontWeight: 600 }}>{s.tasks_overdue}</span>
                          : <span style={{ color: '#9ca3af' }}>0</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'universities' && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600' }}>Статистика университетов</h2>
            <button
              type="button"
              onClick={() => {
                const byCountry = Object.entries(universitiesReport.by_target_country ?? {}).map(([country, count]) => ({ 'Страна': country, 'Студентов': count }));
                const byMajor = Object.entries(universitiesReport.by_target_major ?? {}).map(([major, count]) => ({ 'Направление': major, 'Студентов': count }));
                if (byCountry.length) exportCsv(byCountry, 'отчёт-университеты-страны');
                if (byMajor.length) exportCsv(byMajor, 'отчёт-университеты-направления');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <Download size={13} /> Экспорт CSV
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            {/* By country */}
            <div>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
                По странам
              </h3>
              {Object.keys(universitiesReport.by_target_country ?? {}).length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Нет данных</p>
              ) : (
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(universitiesReport.by_target_country ?? {})
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                        .map(([name, value]) => ({ name, value }))}
                      layout="vertical"
                      margin={{ left: 16, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={11} />
                      <YAxis type="category" dataKey="name" width={80} fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* By major */}
            <div>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
                По направлениям
              </h3>
              {Object.keys(universitiesReport.by_target_major ?? {}).length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Нет данных</p>
              ) : (
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(universitiesReport.by_target_major ?? {})
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                        .map(([name, value]) => ({ name, value }))}
                      layout="vertical"
                      margin={{ left: 16, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={11} />
                      <YAxis type="category" dataKey="name" width={80} fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
