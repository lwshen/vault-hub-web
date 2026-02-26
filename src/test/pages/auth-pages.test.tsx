/**
 * Auth page consistency tests.
 *
 * Verifies that all authentication pages share a consistent layout:
 * - Full-screen centered background
 * - Card-based form container
 * - Expected heading text
 * - Back-to-login navigation links where appropriate
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, unauthenticatedAuthContext } from '@/test/render';

// Mock the API module to prevent any real HTTP calls
vi.mock('@/apis/api', () => ({
  authApi: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    requestMagicLink: vi.fn(),
    requestPasswordReset: vi.fn(),
  },
  userApi: { getCurrentUser: vi.fn() },
  vaultApi: {
    getVaults: vi.fn().mockResolvedValue({ vaults: [], totalCount: 0, pageIndex: 1, pageSize: 10 }),
    deleteVault: vi.fn(),
    updateVault: vi.fn(),
  },
  auditApi: {
    getAuditLogs: vi.fn().mockResolvedValue({ auditLogs: [], total: 0 }),
    getAuditMetrics: vi.fn().mockResolvedValue({}),
  },
  apiKeyApi: {
    getApiKeys: vi.fn().mockResolvedValue({ apiKeys: [], total: 0 }),
    deleteApiKey: vi.fn(),
  },
  statusApi: { getStatus: vi.fn().mockResolvedValue({}) },
  configApi: {
    getConfig: vi.fn().mockResolvedValue({
      oidcEnabled: false,
      emailEnabled: true,
      demoEnabled: false,
    }),
  },
}));

// Mock wouter to avoid routing errors in jsdom
vi.mock('wouter', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useLocation: () => ['/login', vi.fn()],
  useRoute: () => [false, {}],
  Route: ({ children }: { children: React.ReactNode }) => children,
  Switch: ({ children }: { children: React.ReactNode }) => children,
  navigate: vi.fn(),
}));

import Login from '@/pages/auth/login';
import Signup from '@/pages/auth/signup';
import ForgotPassword from '@/pages/auth/forgot-password';
import ResetPassword from '@/pages/auth/reset-password';
import MagicLink from '@/pages/auth/magic-link';

describe('Auth pages — layout consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login page', () => {
    it('renders without crashing', () => {
      renderWithProviders(<Login />, { authContext: unauthenticatedAuthContext });
      expect(document.body).toBeTruthy();
    });

    it('displays the welcome heading', () => {
      renderWithProviders(<Login />, { authContext: unauthenticatedAuthContext });
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    it('renders an email input', () => {
      renderWithProviders(<Login />, { authContext: unauthenticatedAuthContext });
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('renders a primary action button', () => {
      renderWithProviders(<Login />, { authContext: unauthenticatedAuthContext });
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('offers a sign-up link', () => {
      renderWithProviders(<Login />, { authContext: unauthenticatedAuthContext });
      expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    });
  });

  describe('Signup page', () => {
    it('renders without crashing', () => {
      renderWithProviders(<Signup />, { authContext: unauthenticatedAuthContext });
      expect(document.body).toBeTruthy();
    });

    it('renders an email input', () => {
      renderWithProviders(<Signup />, { authContext: unauthenticatedAuthContext });
      const emailInputs = screen.getAllByLabelText(/email/i);
      expect(emailInputs.length).toBeGreaterThan(0);
    });
  });

  describe('Forgot Password page', () => {
    it('renders without crashing', () => {
      renderWithProviders(<ForgotPassword />, { authContext: unauthenticatedAuthContext });
      expect(document.body).toBeTruthy();
    });

    it('displays the reset password heading', () => {
      renderWithProviders(<ForgotPassword />, { authContext: unauthenticatedAuthContext });
      expect(screen.getByText(/reset your password/i)).toBeInTheDocument();
    });

    it('renders an email input', () => {
      renderWithProviders(<ForgotPassword />, { authContext: unauthenticatedAuthContext });
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('renders a send reset link button', () => {
      renderWithProviders(<ForgotPassword />, { authContext: unauthenticatedAuthContext });
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('has a back-to-login link', () => {
      renderWithProviders(<ForgotPassword />, { authContext: unauthenticatedAuthContext });
      expect(screen.getByText(/go back to login/i)).toBeInTheDocument();
    });
  });

  describe('Reset Password page', () => {
    it('renders without crashing', () => {
      renderWithProviders(<ResetPassword />, { authContext: unauthenticatedAuthContext });
      expect(document.body).toBeTruthy();
    });

    it('displays the choose password heading', () => {
      renderWithProviders(<ResetPassword />, { authContext: unauthenticatedAuthContext });
      expect(screen.getByText(/choose a new password/i)).toBeInTheDocument();
    });

    it('shows an invalid link message when no token is present', () => {
      renderWithProviders(<ResetPassword />, { authContext: unauthenticatedAuthContext });
      expect(screen.getByText(/invalid or has already been used/i)).toBeInTheDocument();
    });
  });

  describe('Magic Link page', () => {
    it('renders without crashing', () => {
      renderWithProviders(<MagicLink />, { authContext: unauthenticatedAuthContext });
      expect(document.body).toBeTruthy();
    });

    it('displays the magic link sign in heading', () => {
      renderWithProviders(<MagicLink />, { authContext: unauthenticatedAuthContext });
      expect(screen.getByText(/magic link sign in/i)).toBeInTheDocument();
    });

    it('shows missing token message when no token in URL', () => {
      renderWithProviders(<MagicLink />, { authContext: unauthenticatedAuthContext });
      expect(
        screen.getByText(/missing a token or has already been used/i),
      ).toBeInTheDocument();
    });
  });
});

describe('Auth pages — visual structure consistency', () => {
  const authPages = [
    { name: 'Login', Component: Login },
    { name: 'Signup', Component: Signup },
    { name: 'ForgotPassword', Component: ForgotPassword },
  ];

  it.each(authPages)('$name uses a card-based centered layout', ({ Component }) => {
    const { container } = renderWithProviders(<Component />, {
      authContext: unauthenticatedAuthContext,
    });
    // All auth pages use a full-screen flex container with centered content
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('min-h-full');
  });
});
