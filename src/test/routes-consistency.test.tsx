import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { describe, expect, it, vi } from 'vitest';

import { PATH } from '@/const/path';
import { AppRoutes } from '@/routes';

vi.mock('@/components/hero/hero-section', () => ({
  default: () => <div>home-page</div>,
}));

vi.mock('@/pages/features', () => ({
  default: () => <div>features-page</div>,
}));

vi.mock('@/pages/documentation', () => ({
  default: () => <div>docs-page</div>,
}));

vi.mock('@/pages/auth/login', () => ({
  default: () => <div>login-page</div>,
}));

vi.mock('@/pages/auth/signup', () => ({
  default: () => <div>signup-page</div>,
}));

vi.mock('@/pages/auth/forgot-password', () => ({
  default: () => <div>forgot-password-page</div>,
}));

vi.mock('@/pages/auth/reset-password', () => ({
  default: () => <div>reset-password-page</div>,
}));

vi.mock('@/pages/auth/magic-link', () => ({
  default: () => <div>magic-link-page</div>,
}));

vi.mock('@/pages/dashboard/dashboard', () => ({
  default: () => <div>dashboard-page</div>,
}));

vi.mock('@/pages/dashboard/vaults', () => ({
  default: () => <div>vaults-page</div>,
}));

vi.mock('@/pages/dashboard/vault-detail', () => ({
  default: ({ vaultId }: { vaultId: string; }) => <div>vault-detail-page-{vaultId}</div>,
}));

vi.mock('@/pages/dashboard/api-keys', () => ({
  default: () => <div>api-keys-page</div>,
}));

vi.mock('@/pages/dashboard/audit-log', () => ({
  default: () => <div>audit-log-page</div>,
}));

vi.mock('@/components/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: ReactNode; }) => <>{children}</>,
}));

interface RouteCase {
  path: string;
  expected: string | RegExp;
}

const routeCases: RouteCase[] = [
  { path: PATH.HOME, expected: 'home-page' },
  { path: PATH.FEATURES, expected: 'features-page' },
  { path: PATH.DOCS, expected: 'docs-page' },
  { path: PATH.LOGIN, expected: 'login-page' },
  { path: PATH.SIGNUP, expected: 'signup-page' },
  { path: PATH.FORGOT_PASSWORD, expected: 'forgot-password-page' },
  { path: PATH.RESET_PASSWORD, expected: 'reset-password-page' },
  { path: PATH.MAGIC_LINK_LOGIN, expected: 'magic-link-page' },
  { path: PATH.DASHBOARD, expected: 'dashboard-page' },
  { path: PATH.VAULTS, expected: 'vaults-page' },
  { path: '/dashboard/vaults/vault-123', expected: 'vault-detail-page-vault-123' },
  { path: PATH.API_KEYS, expected: 'api-keys-page' },
  { path: PATH.AUDIT_LOG, expected: 'audit-log-page' },
  { path: '/users/alice', expected: 'Hello, alice!' },
  { path: PATH.ABOUT, expected: '404: No such page!' },
];

const renderAtPath = (path: string) => {
  const { hook, searchHook } = memoryLocation({ path });

  render(
    <Router hook={hook} searchHook={searchHook}>
      <AppRoutes />
    </Router>,
  );
};

describe('AppRoutes page consistency', () => {
  it.each(routeCases)('renders expected page for "$path"', ({ path, expected }) => {
    renderAtPath(path);
    expect(screen.getByText(expected)).toBeTruthy();
  });
});
