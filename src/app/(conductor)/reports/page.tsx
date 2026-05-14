'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useReports } from '@/hooks/useReports';
import type { OverviewReport } from '@/types/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
            Общая статистика
          </h2>

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
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
            Прогресс студентов
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Подробная статистика по прогрессу студентов и их достижениям
          </p>
        </div>
      )}

      {activeTab === 'universities' && (
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
            Статистика университетов
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Топ университеты и направления подготовки
          </p>
        </div>
      )}
    </div>
  );
}
