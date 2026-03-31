import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test-utils';
import Login from '@/pages/auth/login';
import Signup from '@/pages/auth/signup';
import ForgotPassword from '@/pages/auth/forgot-password';
import ResetPassword from '@/pages/auth/reset-password';
import MagicLink from '@/pages/auth/magic-link';

vi.mock('@/apis/api', () => ({
  authApi: {
    consumeMagicLinkRaw: vi.fn(),
    confirmPasswordReset: vi.fn(),
    requestPasswordReset: vi.fn(),
  },
  userApi: { getCurrentUser: vi.fn() },
  vaultApi: {},
  auditApi: {},
  apiKeyApi: {},
  statusApi: {},
  configApi: {},
}));

vi.mock('@/hooks/use-app-config', () => ({
  useAppConfig: () => ({
    oidcEnabled: false,
    emailEnabled: true,
    demoEnabled: false,
    configLoading: false,
  }),
}));

describe('Auth Pages Snapshots', () => {
  it('Login page matches snapshot', () => {
    const { container } = renderWithProviders(<Login />);
    expect(container).toMatchSnapshot();
  });

  it('Signup page matches snapshot', () => {
    const { container } = renderWithProviders(<Signup />);
    expect(container).toMatchSnapshot();
  });

  it('ForgotPassword page matches snapshot', () => {
    const { container } = renderWithProviders(<ForgotPassword />);
    expect(container).toMatchSnapshot();
  });

  it('ResetPassword page matches snapshot (no token)', () => {
    const { container } = renderWithProviders(<ResetPassword />);
    expect(container).toMatchSnapshot();
  });

  it('ResetPassword page matches snapshot (with token)', () => {
    const original = window.location.search;
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '?token=valid-reset-token-1234567890' },
      writable: true,
    });
    const { container } = renderWithProviders(<ResetPassword />);
    expect(container).toMatchSnapshot();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: original },
      writable: true,
    });
  });

  it('MagicLink page matches snapshot (no token)', () => {
    const { container } = renderWithProviders(<MagicLink />);
    expect(container).toMatchSnapshot();
  });

  it('MagicLink page matches snapshot (with token)', () => {
    const original = window.location.search;
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '?token=valid-magic-link-token-1234567890' },
      writable: true,
    });
    const { container } = renderWithProviders(<MagicLink />);
    expect(container).toMatchSnapshot();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: original },
      writable: true,
    });
  });
});
