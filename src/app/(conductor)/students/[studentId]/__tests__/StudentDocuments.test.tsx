import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StudentDocumentsPage from '../documents/page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ studentId: 'student-1' }),
}));

const mockUpload = vi.fn();
const mockRemove = vi.fn();

vi.mock('@/hooks/useProfile', () => ({
  useStudentDocuments: vi.fn(),
  useUploadDocument: () => ({ mutate: mockUpload, isPending: false }),
  useDeleteDocument: () => ({ mutate: mockRemove, isPending: false }),
}));

import * as profileHooks from '@/hooks/useProfile';
const mockUseStudentDocuments = profileHooks.useStudentDocuments as ReturnType<typeof vi.fn>;

describe('StudentDocumentsPage', () => {
  it('shows uploaded documents with type and size', () => {
    mockUseStudentDocuments.mockReturnValue({
      data: [
        {
          id: 'doc-1',
          student_id: 'student-1',
          doc_type: 'passport',
          category: 'personal',
          status: 'active',
          expires_at: null,
          url: 'https://storage/passport.pdf',
          content_type: 'application/pdf',
          size: 204800,
          created_at: '2026-05-01T00:00:00.000Z',
        },
      ],
      isLoading: false,
    });

    render(<StudentDocumentsPage />);

    expect(screen.getAllByText('passport').length).toBeGreaterThan(0);
    expect(screen.getByText(/200 KB/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('href', 'https://storage/passport.pdf');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('shows empty state when no documents', () => {
    mockUseStudentDocuments.mockReturnValue({ data: [], isLoading: false });

    render(<StudentDocumentsPage />);

    expect(screen.getByText('No documents uploaded.')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseStudentDocuments.mockReturnValue({ data: undefined, isLoading: true });

    render(<StudentDocumentsPage />);

    expect(screen.getByText('Loading documents...')).toBeInTheDocument();
  });

  it('shows upload form with doc type selector and upload button', () => {
    mockUseStudentDocuments.mockReturnValue({ data: [], isLoading: false });

    render(<StudentDocumentsPage />);

    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByDisplayValue('passport')).toBeInTheDocument();
  });
});
