import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import UniversityDetailPage from '../page';
import type { UniversityDetail } from '@/types/api';

vi.mock('next/navigation', () => ({
  useParams: () => ({ universityId: 'uni-1' }),
}));

vi.mock('@/components/layout/PageHeader', () => ({
  PageHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
  ),
}));

vi.mock('@/components/universities/UniversityForm', () => ({
  UniversityForm: () => <div>UniversityForm</div>,
}));

vi.mock('@/components/ui/ImageUpload', () => ({
  ImageUpload: ({ label }: { label: string }) => <div>{label}</div>,
}));

const mockUpdateUniversity = vi.fn();
const mockUploadLogo = vi.fn();
const mockUploadCover = vi.fn();
const mockCreateProgram = vi.fn();
const mockDeleteProgram = vi.fn();
const mockUseUniversity = vi.fn();

vi.mock('@/hooks/useUniversities', () => ({
  useUniversity: (...args: unknown[]) => mockUseUniversity(...args),
  useUpdateUniversity: () => ({ mutateAsync: mockUpdateUniversity, isPending: false }),
  useUploadLogo: () => ({ mutateAsync: mockUploadLogo, isPending: false }),
  useUploadCover: () => ({ mutateAsync: mockUploadCover, isPending: false }),
  useCreateProgram: () => ({ mutateAsync: mockCreateProgram, isPending: false }),
  useDeleteProgram: () => ({ mutate: mockDeleteProgram, isPending: false }),
}));

const mockUseUniversityEnrollments = vi.fn();
vi.mock('@/hooks/useEnrollments', () => ({
  useUniversityEnrollments: (...args: unknown[]) => mockUseUniversityEnrollments(...args),
  useUpdateEnrollment: () => ({ mutate: vi.fn(), isPending: false }),
}));

const mockDetail: UniversityDetail = {
  university: {
    id: 'uni-1',
    name: 'MIT',
    country: 'USA',
    city: 'Cambridge',
    logo_url: null,
    cover_image_url: null,
    website_url: null,
    description: null,
    acceptance_rate: null,
    total_students: null,
    international_pct: null,
    qs_ranking: 1,
    the_ranking: null,
    language_of_instr: null,
    is_published: true,
    last_verified_at: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  programs: [
    {
      id: 'prog-1',
      university_id: 'uni-1',
      name: 'Computer Science',
      degree_level: 'bachelor',
      field: 'Engineering',
      min_gpa: 3.5,
      min_ielts: 7.0,
      min_sat: null,
      tuition_usd: 57000,
      scholarship_info: null,
      application_fee: null,
      intake_seasons: null,
      deadline: null,
      campus_life: null,
      requirements_text: null,
      apply_url: null,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ],
};

describe('UniversityDetailPage', () => {
  beforeEach(() => {
    mockUseUniversity.mockReturnValue({ data: mockDetail, isLoading: false });
    mockUseUniversityEnrollments.mockReturnValue({
      data: { data: [], meta: { page: 1, page_size: 20, total: 0 } },
      isLoading: false,
    });
  });

  it('renders the university name in the header', () => {
    render(<UniversityDetailPage />);

    expect(screen.getByText('MIT')).toBeInTheDocument();
    expect(screen.getByText('Cambridge, USA')).toBeInTheDocument();
  });

  it('shows programs tab with program cards', async () => {
    const user = userEvent.setup();
    render(<UniversityDetailPage />);

    await user.click(screen.getByRole('button', { name: /Programs/ }));

    expect(screen.getByText('Computer Science')).toBeInTheDocument();
  });

  it('shows empty enrollments state in applications tab', async () => {
    const user = userEvent.setup();
    render(<UniversityDetailPage />);

    await user.click(screen.getByRole('button', { name: /Applications/ }));

    expect(screen.getByText('Нет заявок')).toBeInTheDocument();
  });
});
