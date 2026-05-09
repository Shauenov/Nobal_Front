'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import { DOC_TYPES } from '@/types/api';
import { useDeleteDocument, useStudentDocuments, useUploadDocument } from '@/hooks/useProfile';

const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  boxShadow: 'var(--shadow-sm)',
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const inputStyle: CSSProperties = {
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  padding: '8px 10px',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
};

const getStudentId = (value: string | string[] | undefined) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? '';
  return '';
};

const formatSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function StudentDocumentsPage() {
  const params = useParams();
  const studentId = getStudentId(params.studentId);
  const documents = useStudentDocuments(studentId);
  const upload = useUploadDocument(studentId);
  const remove = useDeleteDocument(studentId);

  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) return;
    upload.mutate({ file, docType });
    setFile(null);
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div style={cardStyle}>
        <div style={labelStyle}>Upload document</div>
        <div style={{ marginTop: 'var(--space-3)', display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <select style={inputStyle} value={docType} onChange={(event) => setDocType(event.target.value as typeof docType)}>
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            type="file"
            style={inputStyle}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || upload.isPending}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid transparent',
              background: 'var(--color-primary)',
              color: '#fff',
              fontWeight: 'var(--font-semibold)',
              opacity: !file || upload.isPending ? 0.7 : 1,
            }}
          >
            {upload.isPending ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Documents</div>
        <div style={{ marginTop: 'var(--space-3)', display: 'grid', gap: 'var(--space-3)' }}>
          {documents.isLoading ? (
            <div style={{ color: 'var(--color-text-secondary)' }}>Loading documents...</div>
          ) : documents.data?.length ? (
            documents.data.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-hover)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'var(--font-medium)' }}>{doc.doc_type}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    {formatSize(doc.size)} · {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <a href={doc.url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => remove.mutate(doc.doc_type)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-error)',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--color-text-secondary)' }}>No documents uploaded.</div>
          )}
        </div>
      </div>
    </div>
  );
}
