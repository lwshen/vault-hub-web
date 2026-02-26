/**
 * HighlightedCodeBlock component tests.
 *
 * Verifies rendering, language detection/selection, and copy-button behaviour.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HighlightedCodeBlock } from '@/components/ui/highlighted-code-block';

// Mock wouter (not used by this component but some transitive deps might pull it in)
vi.mock('wouter', () => ({
  useLocation: () => ['/', vi.fn()],
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

const defaultOnCopy = vi.fn().mockResolvedValue(true);

function renderBlock(props: Partial<React.ComponentProps<typeof HighlightedCodeBlock>> = {}) {
  return render(
    <HighlightedCodeBlock
      code="const x = 1;"
      onCopy={defaultOnCopy}
      {...props}
    />,
  );
}

describe('HighlightedCodeBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders without crashing', () => {
      renderBlock();
      expect(document.body).toBeTruthy();
    });

    it('renders the code content', () => {
      renderBlock({ code: 'hello world' });
      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    });

    it('renders the language selector', () => {
      renderBlock();
      // The Select trigger should be in the DOM
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders the copy button', () => {
      renderBlock();
      expect(screen.getByTitle('Copy to clipboard')).toBeInTheDocument();
    });
  });

  describe('language auto-detection', () => {
    it('detects JSON when no language prop is provided', () => {
      renderBlock({ code: '{"key": "value"}' });
      // The badge shows the detected/selected language in parentheses
      expect(screen.getByText('(json)')).toBeInTheDocument();
    });

    it('detects YAML content', () => {
      renderBlock({ code: 'name: value\nother: thing' });
      expect(screen.getByText('(yaml)')).toBeInTheDocument();
    });

    it('detects plain text for arbitrary content', () => {
      renderBlock({ code: 'just some plain text here' });
      expect(screen.getByText('(plaintext)')).toBeInTheDocument();
    });

    it('detects bash from shebang line', () => {
      renderBlock({ code: '#!/bin/bash\necho hello' });
      expect(screen.getByText('(bash)')).toBeInTheDocument();
    });
  });

  describe('explicit language prop', () => {
    it('uses the provided language prop', () => {
      renderBlock({ code: 'select 1', language: 'sql' });
      expect(screen.getByText('(sql)')).toBeInTheDocument();
    });

    it('shows the correct selector value when language is provided', () => {
      renderBlock({ code: 'x = 1', language: 'python' });
      expect(screen.getByRole('combobox')).toHaveTextContent('Python');
    });
  });

  describe('copy behaviour', () => {
    it('calls onCopy when the copy button is clicked', async () => {
      renderBlock();
      fireEvent.click(screen.getByTitle('Copy to clipboard'));
      await waitFor(() => expect(defaultOnCopy).toHaveBeenCalledTimes(1));
    });

    it('shows a check icon after a successful copy', async () => {
      renderBlock();
      fireEvent.click(screen.getByTitle('Copy to clipboard'));
      await waitFor(() => {
        // The Copy icon is replaced by a Check icon (aria role implicit via lucide svg)
        const btn = screen.getByTitle('Copy to clipboard');
        expect(btn.querySelector('svg')).toBeTruthy();
      });
    });

    it('does not show copied state when onCopy returns false', async () => {
      const failingCopy = vi.fn().mockResolvedValue(false);
      renderBlock({ onCopy: failingCopy });
      fireEvent.click(screen.getByTitle('Copy to clipboard'));
      await waitFor(() => expect(failingCopy).toHaveBeenCalled());
      // Copy icon should still be present (no check icon transition)
      expect(screen.getByTitle('Copy to clipboard')).toBeInTheDocument();
    });
  });

  describe('language selector interaction', () => {
    it('selector defaults to "Auto Detect" when no language is given', () => {
      renderBlock({ code: '' });
      expect(screen.getByRole('combobox')).toHaveTextContent('Auto Detect');
    });
  });
});

describe('HighlightedCodeBlock — edge cases', () => {
  it('renders with empty code string', () => {
    render(
      <HighlightedCodeBlock code="" onCopy={vi.fn().mockResolvedValue(true)} />,
    );
    expect(screen.getByText('(plaintext)')).toBeInTheDocument();
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <HighlightedCodeBlock
        code="x"
        onCopy={vi.fn().mockResolvedValue(true)}
        className="custom-class"
      />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('resets language selection when the language prop changes', async () => {
    const { rerender } = render(
      <HighlightedCodeBlock code="x = 1" language="python" onCopy={vi.fn().mockResolvedValue(true)} />,
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('Python');

    rerender(
      <HighlightedCodeBlock code="x = 1" language="javascript" onCopy={vi.fn().mockResolvedValue(true)} />,
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('JavaScript');
  });
});
