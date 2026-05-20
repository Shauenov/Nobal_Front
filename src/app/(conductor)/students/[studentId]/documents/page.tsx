'use client';

import { useState, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import { Upload, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { DOC_TYPES, type DocumentOut, type DocumentStatus, type DocumentCategory } from '@/types/api';
import { useDeleteDocument, useStudentDocuments, useUploadDocument } from '@/hooks/useProfile';

/* ─── Helpers ─── */
const getStudentId = (value: string | string[] | undefined) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? '';
  return '';
};

const formatSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const daysUntil = (dateStr: string | null): number | null => {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: 'Паспорт',
  transcript: 'Транскрипт',
  ielts_certificate: 'Сертификат IELTS',
  sat_certificate: 'Сертификат SAT',
  recommendation_letter: 'Рекомендательное письмо',
  personal_statement: 'Мотивационное письмо',
  other: 'Другой',
};

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  personal: 'Личный',
  education: 'Образование',
  financial: 'Финансы',
  other: 'Другое',
};

const STATUS_CONFIG: Record<DocumentStatus, { label: string; bg: string; color: string }> = {
  active:       { label: 'Активен',      bg: '#dcfce7', color: '#166534' },
  pending:      { label: 'На проверке',  bg: '#fef9c3', color: '#a16207' },
  expired:      { label: 'Истёк',        bg: '#fee2e2', color: '#991b1b' },
  needs_update: { label: 'Нужно обновить', bg: '#ede9fe', color: '#6d28d9' },
};

const CATEGORIES: DocumentCategory[] = ['personal', 'education', 'financial', 'other'];

/* ─── Styles ─── */
const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  boxShadow: 'var(--shadow-sm)',
};

const thStyle: CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  whiteSpace: 'nowrap',
};

const tdStyle: CSSProperties = {
  padding: '10px 12px',
  fontSize: '0.875rem',
  color: 'var(--color-text-primary)',
  borderBottom: '1px solid var(--color-border)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  fontSize: '0.875rem',
  color: '#1e293b',
  background: '#fff',
};

/* ─── Upload panel ─── */
function UploadPanel({ studentId }: { studentId: string }) {
  const upload = useUploadDocument(studentId);
  const [docType, setDocType] = useState<string>(DOC_TYPES[0]);
  const [category, setCategory] = useState<DocumentCategory>('personal');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    upload.mutate({ file, docType, category });
    setFile(null);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' }}>
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>Тип документа</label>
        <select style={inputStyle} value={docType} onChange={(e) => setDocType(e.target.value)}>
          {DOC_TYPES.map((t) => (
            <option key={t} value={t}>{DOC_TYPE_LABELS[t] ?? t}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>Категория</label>
        <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>Файл</label>
        <input
          type="file"
          style={{ ...inputStyle, padding: '6px 10px' }}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
      </div>
      <button
        type="submit"
        disabled={!file || upload.isPending}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '10px 14px', borderRadius: 8, border: 'none',
          background: '#2563eb', color: '#fff', fontWeight: 600,
          fontSize: '0.875rem', cursor: !file || upload.isPending ? 'not-allowed' : 'pointer',
          opacity: !file || upload.isPending ? 0.7 : 1,
        }}
      >
        <Upload size={14} />
        {upload.isPending ? 'Загрузка…' : 'Загрузить'}
      </button>
    </form>
  );
}

/* ─── Documents table ─── */
function DocumentTable({ docs, onDelete, isDeleting }: {
  docs: DocumentOut[];
  onDelete: (docType: string) => void;
  isDeleting: boolean;
}) {
  const sorted = [...docs].sort((a, b) => {
    // Sort: expires_at ascending (nulls last)
    if (!a.expires_at && !b.expires_at) return 0;
    if (!a.expires_at) return 1;
    if (!b.expires_at) return -1;
    return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
            {['Документ', 'Категория', 'Статус', 'Истекает', 'Размер', 'Действия'].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((doc) => {
            const sc = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.pending;
            const days = daysUntil(doc.expires_at);
            const expiringSoon = days !== null && days >= 0 && days <= 30;

            return (
              <tr key={doc.id} style={{ background: expiringSoon ? '#fffbeb' : undefined }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500 }}>{DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}</div>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    {CATEGORY_LABELS[doc.category] ?? doc.category}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 9999,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: sc.bg,
                    color: sc.color,
                  }}>
                    {sc.label}
                  </span>
                </td>
                <td style={tdStyle}>
                  {doc.expires_at ? (
                    <span style={{ color: expiringSoon ? '#d97706' : 'var(--color-text-secondary)', fontWeight: expiringSoon ? 600 : 400 }}>
                      {new Date(doc.expires_at).toLocaleDateString('ru-RU')}
                      {expiringSoon && ` (${days}д.)`}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
                  )}
                </td>
                <td style={{ ...tdStyle, color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                  {formatSize(doc.size)}
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 12px',
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        boxShadow: '0 1px 4px rgba(37,99,235,0.25)',
                        transition: 'opacity 150ms',
                      }}
                    >
                      <ExternalLink size={12} /> Открыть
                    </a>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => {
                        if (confirm('Удалить этот документ?')) {
                          onDelete(doc.doc_type);
                        }
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '5px 10px', borderRadius: 8,
                        border: '1px solid #fecaca', background: '#fff5f5',
                        color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600,
                      }}
                    >
                      <Trash2 size={11} /> Удалить
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Page ─── */
export default function StudentDocumentsPage() {
  const params = useParams();
  const studentId = getStudentId(params.studentId);
  const { data: docs, isLoading } = useStudentDocuments(studentId);
  const remove = useDeleteDocument(studentId);

  const allDocs = docs ?? [];
  const expiringSoonCount = allDocs.filter((d) => {
    const days = daysUntil(d.expires_at);
    return days !== null && days >= 0 && days <= 30;
  }).length;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {/* Upload card */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
            Загрузить документ
          </span>
          {expiringSoonCount > 0 && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 9999,
              background: '#fef3c7', color: '#92400e',
              fontSize: '0.75rem', fontWeight: 600,
            }}>
              <AlertCircle size={13} />
              Скоро истекают: {expiringSoonCount}
            </span>
          )}
        </div>
        <UploadPanel studentId={studentId} />
      </div>

      {/* Documents table card */}
      <div style={cardStyle}>
        <div style={{ marginBottom: 14, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
          Документы {!isLoading && `(${allDocs.length})`}
        </div>
        {isLoading ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>Загрузка...</div>
        ) : allDocs.length === 0 ? (
          <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 32 }}>
            Нет загруженных документов
          </div>
        ) : (
          <DocumentTable
            docs={allDocs}
            onDelete={(docType) => remove.mutate(docType)}
            isDeleting={remove.isPending}
          />
        )}
      </div>
    </div>
  );
}
