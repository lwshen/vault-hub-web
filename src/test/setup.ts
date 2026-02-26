import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock sonner toast to avoid side effects in tests
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock next-themes to avoid theme-related errors in jsdom
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ theme: 'light', setTheme: vi.fn(), resolvedTheme: 'light' }),
}));

// Mock CodeMirror to avoid complex editor setup in tests
vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value }: { value: string }) => {
    const { createElement } = require('react');
    return createElement('div', { 'data-testid': 'code-editor', 'data-value': value }, value);
  },
}));

// Mock highlight.js
vi.mock('highlight.js', () => ({
  default: {
    getLanguage: vi.fn(),
    highlight: vi.fn(() => ({ value: '' })),
    highlightAuto: vi.fn(() => ({ value: '', language: 'plaintext' })),
  },
}));

// Suppress console.error for expected errors in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
  vi.clearAllMocks();
});
