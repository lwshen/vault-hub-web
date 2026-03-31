import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import Features from '@/pages/features';
import Documentation from '@/pages/documentation';

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        return ({ children, className, ...rest }: Record<string, unknown>) => {
          return React.createElement(prop, { className, 'data-testid': rest['data-testid'] }, children as React.ReactNode);
        };
      },
    },
  ),
}));

vi.mock('@/docs/toc', () => ({
  documentationTOC: [
    { id: 'cli-guide', title: 'CLI Guide', content: '# CLI Guide\nSample content' },
    { id: 'server-setup', title: 'Server Setup', content: '# Server Setup\nSample content' },
  ],
  getDocumentationItem: (id: string) => {
    const items: Record<string, { id: string; title: string; content: string; }> = {
      'cli-guide': { id: 'cli-guide', title: 'CLI Guide', content: '# CLI Guide\nSample content' },
      'server-setup': { id: 'server-setup', title: 'Server Setup', content: '# Server Setup\nSample content' },
    };
    return items[id] ?? null;
  },
  getDefaultDocumentation: () => ({ id: 'cli-guide', title: 'CLI Guide', content: '# CLI Guide\nSample content' }),
}));

vi.mock('@/components/ui/markdown-content', () => ({
  MarkdownContent: ({ children }: { children: string; }) => <div data-testid="markdown">{children}</div>,
}));

describe('Public Pages Snapshots', () => {
  it('Features page matches snapshot', () => {
    const { container } = render(<Features />);
    expect(container).toMatchSnapshot();
  });

  it('Documentation page matches snapshot', () => {
    const { container } = render(<Documentation />);
    expect(container).toMatchSnapshot();
  });
});
