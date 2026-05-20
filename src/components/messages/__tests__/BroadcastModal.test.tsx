import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BroadcastModal } from '../BroadcastModal';

const mockBroadcast = vi.fn();

vi.mock('@/hooks/useMessages', () => ({
  useBroadcast: () => ({
    mutateAsync: mockBroadcast,
    isPending: false,
  }),
  useBroadcastImage: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('BroadcastModal', () => {
  beforeEach(() => {
    mockBroadcast.mockClear();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<BroadcastModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders form fields when isOpen is true', () => {
    render(<BroadcastModal isOpen onClose={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Рассылка' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Напишите текст рассылки...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Напр. D, F')).toBeInTheDocument();
    expect(screen.getByLabelText(/Только студенты, сдавшие IELTS/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Отправить рассылку' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Отмена' })).toBeInTheDocument();
  });

  it('sends broadcast with body only (minimal form)', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();

    render(<BroadcastModal isOpen onClose={mockOnClose} />);

    const bodyTextarea = screen.getByPlaceholderText('Напишите текст рассылки...');
    await user.type(bodyTextarea, 'Hello students!');

    const sendButton = screen.getByRole('button', { name: 'Отправить рассылку' });
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'Hello students!',
        })
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('sends broadcast with filter_group', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();

    render(<BroadcastModal isOpen onClose={mockOnClose} />);

    await user.type(screen.getByPlaceholderText('Напишите текст рассылки...'), 'Notice for D group');
    await user.type(screen.getByPlaceholderText('Напр. D, F'), 'D');

    await user.click(screen.getByRole('button', { name: 'Отправить рассылку' }));

    await waitFor(() => {
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'Notice for D group',
          filter_group: 'D',
        })
      );
    });
  });

  it('sends broadcast with ielts_passed flag', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();

    render(<BroadcastModal isOpen onClose={mockOnClose} />);

    await user.type(screen.getByPlaceholderText('Напишите текст рассылки...'), 'Congratulations on IELTS');
    const ieltCheckbox = screen.getByRole('checkbox');
    await user.click(ieltCheckbox);

    await user.click(screen.getByRole('button', { name: 'Отправить рассылку' }));

    await waitFor(() => {
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'Congratulations on IELTS',
        })
      );
    });
  });

  it('disables send button when body is empty', async () => {
    render(<BroadcastModal isOpen onClose={() => {}} />);

    const sendButton = screen.getByRole('button', { name: 'Отправить рассылку' });
    expect(sendButton).toBeDisabled();
  });

  it('cancels and closes modal on cancel button click', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();

    render(<BroadcastModal isOpen onClose={mockOnClose} />);

    await user.type(screen.getByPlaceholderText('Напишите текст рассылки...'), 'Some message');
    await user.click(screen.getByRole('button', { name: 'Отмена' }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal on overlay click', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<BroadcastModal isOpen onClose={mockOnClose} />);
    const overlay = container.querySelector('div[style*="fixed"]') as HTMLElement;

    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('trims whitespace from message body', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();

    render(<BroadcastModal isOpen onClose={mockOnClose} />);

    await user.type(screen.getByPlaceholderText('Напишите текст рассылки...'), '  Hello  ');

    await user.click(screen.getByRole('button', { name: 'Отправить рассылку' }));

    await waitFor(() => {
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'Hello',
        })
      );
    });
  });
});
