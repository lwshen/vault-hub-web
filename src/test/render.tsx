import { AuthContext, type AuthContextType } from '@/contexts/auth-context';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactNode } from 'react';

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockAuthContext: AuthContextType = {
  isAuthenticated: true,
  user: mockUser,
  isLoading: false,
  login: vi.fn().mockResolvedValue(undefined),
  loginWithOidc: vi.fn().mockResolvedValue(undefined),
  signup: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn(),
  requestMagicLink: vi.fn().mockResolvedValue(undefined),
  requestPasswordReset: vi.fn().mockResolvedValue(undefined),
  authenticateWithToken: vi.fn().mockResolvedValue(undefined),
};

export const unauthenticatedAuthContext: AuthContextType = {
  ...mockAuthContext,
  isAuthenticated: false,
  user: null,
};

interface WrapperProps {
  children: ReactNode;
  authContext?: AuthContextType;
}

function AllProviders({ children, authContext = mockAuthContext }: WrapperProps) {
  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authContext?: AuthContextType;
}

export function renderWithProviders(
  ui: ReactNode,
  { authContext, ...options }: CustomRenderOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders authContext={authContext}>{children}</AllProviders>
    ),
    ...options,
  });
}
