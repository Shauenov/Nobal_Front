import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { UniversityOut } from '@/types/api';
import { UniversityCard } from '../UniversityCard';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

const mockUniversity: UniversityOut = {
  id: 'uni-1',
  name: 'Test University',
  country: 'USA',
  city: 'New York',
  qs_ranking: 45,
  acceptance_rate: 0.25,
  international_pct: 0.4,
  language_of_instr: 'English',
  is_published: true,
  created_at: '2026-05-09T00:00:00Z',
  updated_at: '2026-05-09T00:00:00Z',
};

describe('UniversityCard', () => {
  it('renders university name', () => {
    render(<UniversityCard university={mockUniversity} />);

    expect(screen.getByText('Test University')).toBeInTheDocument();
  });

  it('renders location from city and country', () => {
    render(<UniversityCard university={mockUniversity} />);

    expect(screen.getByText(/New York, USA/)).toBeInTheDocument();
  });

  it('renders QS ranking badge', () => {
    render(<UniversityCard university={mockUniversity} />);

    expect(screen.getByText(/Рейтинг #45/)).toBeInTheDocument();
  });

  it('renders acceptance rate progress section', () => {
    render(<UniversityCard university={mockUniversity} />);

    expect(screen.getByText('Уровень поступления')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('renders popularity progress section when international_pct provided', () => {
    render(<UniversityCard university={mockUniversity} />);

    expect(screen.getByText('Популярность')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('hides ranking badge when qs_ranking is null', () => {
    render(<UniversityCard university={{ ...mockUniversity, qs_ranking: null }} />);

    expect(screen.queryByText(/Рейтинг/)).not.toBeInTheDocument();
  });

  it('hides acceptance rate section when acceptance_rate is null', () => {
    render(<UniversityCard university={{ ...mockUniversity, acceptance_rate: null }} />);

    expect(screen.queryByText('Уровень поступления')).not.toBeInTheDocument();
  });

  it('has action links for applications and management', () => {
    render(<UniversityCard university={mockUniversity} />);

    const applicationsLink = screen.getByRole('link', { name: /Список заявок/ });
    expect(applicationsLink).toHaveAttribute('href', '/universities/uni-1?tab=applications');

    const manageLink = screen.getByRole('link', { name: /Управлять/ });
    expect(manageLink).toHaveAttribute('href', '/universities/uni-1');
  });
});
