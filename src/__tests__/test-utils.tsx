import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { AuthContext, type AuthContextType } from '@/contexts/auth-context';

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  login: vi.fn(),
  loginWithOidc: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  isLoading: false,
  requestMagicLink: vi.fn(),
  requestPasswordReset: vi.fn(),
  authenticateWithToken: vi.fn(),
};

const authenticatedAuthContext: AuthContextType = {
  ...defaultAuthContext,
  isAuthenticated: true,
  user: { id: 'test-user-id', email: 'test@example.com', name: 'Test User' } as AuthContextType['user'],
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authContext?: Partial<AuthContextType>;
  authenticated?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  { authContext, authenticated = false, ...options }: CustomRenderOptions = {},
) {
  const baseContext = authenticated ? authenticatedAuthContext : defaultAuthContext;
  const mergedAuth = { ...baseContext, ...authContext };

  function Wrapper({ children }: { children: React.ReactNode; }) {
    return (
      <AuthContext value={mergedAuth}>
        {children}
      </AuthContext>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
