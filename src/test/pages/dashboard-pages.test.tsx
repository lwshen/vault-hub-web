/**
 * Dashboard page consistency tests.
 *
 * Verifies that all dashboard pages:
 * - Render without crashing
 * - Include the sidebar navigation (DashboardLayout)
 * - Display the correct page heading (h1)
 * - Show all expected navigation items
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';

// Mock API module
vi.mock('@/apis/api', () => ({
  authApi: { login: vi.fn(), signup: vi.fn(), logout: vi.fn() },
  userApi: { getCurrentUser: vi.fn() },
  vaultApi: {
    getVaults: vi.fn().mockResolvedValue({ vaults: [], totalCount: 0, pageIndex: 1, pageSize: 10 }),
    deleteVault: vi.fn(),
    updateVault: vi.fn(),
    getVault: vi.fn().mockResolvedValue({ uniqueId: '1', name: 'Test Vault', value: '' }),
  },
  auditApi: {
    getAuditLogs: vi.fn().mockResolvedValue({ auditLogs: [], total: 0 }),
    getAuditMetrics: vi.fn().mockResolvedValue({
      totalEventsLast30Days: 0,
      eventsCountLast24Hours: 0,
      vaultEventsLast30Days: 0,
      apiKeyEventsLast30Days: 0,
    }),
  },
  apiKeyApi: {
    getApiKeys: vi.fn().mockResolvedValue({ apiKeys: [], total: 0 }),
    deleteApiKey: vi.fn(),
    createApiKey: vi.fn(),
  },
  statusApi: {
    getStatus: vi.fn().mockResolvedValue({
      systemStatus: 'healthy',
      databaseStatus: 'healthy',
      version: '1.0.0',
      commit: 'abc1234',
    }),
  },
  configApi: {
    getConfig: vi.fn().mockResolvedValue({
      oidcEnabled: false,
      emailEnabled: true,
      demoEnabled: false,
    }),
  },
}));

// Mock Zustand vault store
vi.mock('@/stores/vault-store', () => ({
  useVaultStore: vi.fn(() => ({
    vaults: [],
    isLoading: false,
    error: null,
    isDeleting: false,
    totalCount: 0,
    totalPages: 0,
    pageSize: 10,
    pageIndex: 1,
    fetchVaults: vi.fn().mockResolvedValue(undefined),
    deleteVault: vi.fn().mockResolvedValue(undefined),
    setPageIndex: vi.fn(),
    setPageSize: vi.fn(),
    clearError: vi.fn(),
    reset: vi.fn(),
  })),
}));

// Mock Zustand API key store
vi.mock('@/stores/api-key-store', () => ({
  useApiKeyStore: vi.fn(() => ({
    apiKeys: [],
    isLoading: false,
    error: null,
    fetchApiKeys: vi.fn().mockResolvedValue(undefined),
    deleteApiKey: vi.fn().mockResolvedValue(undefined),
    clearError: vi.fn(),
    reset: vi.fn(),
  })),
}));

// Mock Zustand audit log store
vi.mock('@/stores/audit-store', () => ({
  useAuditLogStore: vi.fn(() => ({
    auditLogs: [],
    metrics: null,
    vaultFilterOptions: [],
    isLoading: false,
    metricsLoading: false,
    vaultFilterOptionsLoading: false,
    error: null,
    currentPage: 1,
    totalCount: 0,
    totalPages: 0,
    pageSize: 20,
    vaultFilter: null,
    sourceFilter: 'all',
    fetchAuditLogs: vi.fn().mockResolvedValue(undefined),
    fetchMetrics: vi.fn().mockResolvedValue(undefined),
    fetchVaultFilterOptions: vi.fn().mockResolvedValue(undefined),
    setPageSize: vi.fn(),
    setCurrentPage: vi.fn(),
    setVaultFilter: vi.fn(),
    setSourceFilter: vi.fn(),
    clearFilters: vi.fn(),
    clearError: vi.fn(),
    reset: vi.fn(),
  })),
}));

// Mock wouter
vi.mock('wouter', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useLocation: () => ['/dashboard', vi.fn()],
  useRoute: () => [false, {}],
  Route: ({ children }: { children: React.ReactNode }) => children,
  Switch: ({ children }: { children: React.ReactNode }) => children,
  navigate: vi.fn(),
}));

import Dashboard from '@/pages/dashboard/dashboard';
import Vaults from '@/pages/dashboard/vaults';
import ApiKeys from '@/pages/dashboard/api-keys';
import AuditLog from '@/pages/dashboard/audit-log';

const SIDEBAR_NAV_LABELS = ['Dashboard', 'Vaults', 'API Keys', 'Audit Log'];

describe('Dashboard pages — render integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dashboard page', () => {
    it('renders without crashing', () => {
      renderWithProviders(<Dashboard />);
      expect(document.body).toBeTruthy();
    });

    it('displays the Dashboard h1 heading', () => {
      renderWithProviders(<Dashboard />);
      expect(screen.getByRole('heading', { name: /^dashboard$/i, level: 1 })).toBeInTheDocument();
    });

    it('includes the sidebar navigation', () => {
      renderWithProviders(<Dashboard />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('shows all sidebar navigation items', () => {
      renderWithProviders(<Dashboard />);
      for (const label of SIDEBAR_NAV_LABELS) {
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
      }
    });
  });

  describe('Vaults page', () => {
    it('renders without crashing', () => {
      renderWithProviders(<Vaults />);
      expect(document.body).toBeTruthy();
    });

    it('displays the Vaults h1 heading', () => {
      renderWithProviders(<Vaults />);
      expect(screen.getByRole('heading', { name: /^vaults$/i, level: 1 })).toBeInTheDocument();
    });

    it('includes the sidebar navigation', () => {
      renderWithProviders(<Vaults />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('shows all sidebar navigation items', () => {
      renderWithProviders(<Vaults />);
      for (const label of SIDEBAR_NAV_LABELS) {
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
      }
    });

    it('shows at least one button to create a new vault', () => {
      renderWithProviders(<Vaults />);
      const buttons = screen.getAllByRole('button', { name: /new vault/i });
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('shows empty state when there are no vaults', () => {
      renderWithProviders(<Vaults />);
      expect(screen.getByText(/no vaults found/i)).toBeInTheDocument();
    });
  });

  describe('API Keys page', () => {
    it('renders without crashing', () => {
      renderWithProviders(<ApiKeys />);
      expect(document.body).toBeTruthy();
    });

    it('displays the API Keys h1 heading', () => {
      renderWithProviders(<ApiKeys />);
      expect(screen.getByRole('heading', { name: /api keys/i, level: 1 })).toBeInTheDocument();
    });

    it('includes the sidebar navigation', () => {
      renderWithProviders(<ApiKeys />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('shows all sidebar navigation items', () => {
      renderWithProviders(<ApiKeys />);
      for (const label of SIDEBAR_NAV_LABELS) {
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
      }
    });
  });

  describe('Audit Log page', () => {
    it('renders without crashing', () => {
      renderWithProviders(<AuditLog />);
      expect(document.body).toBeTruthy();
    });

    it('displays the Audit Log h1 heading', () => {
      renderWithProviders(<AuditLog />);
      expect(screen.getByRole('heading', { name: /audit log/i, level: 1 })).toBeInTheDocument();
    });

    it('includes the sidebar navigation', () => {
      renderWithProviders(<AuditLog />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('shows all sidebar navigation items', () => {
      renderWithProviders(<AuditLog />);
      for (const label of SIDEBAR_NAV_LABELS) {
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
      }
    });
  });
});

describe('Dashboard pages — layout consistency', () => {
  const pages = [
    { name: 'Dashboard', Component: Dashboard },
    { name: 'Vaults', Component: Vaults },
    { name: 'API Keys', Component: ApiKeys },
    { name: 'Audit Log', Component: AuditLog },
  ];

  it.each(pages)('$name wraps content in DashboardLayout (has sidebar nav)', ({ Component }) => {
    renderWithProviders(<Component />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it.each(pages)('$name contains an h1 page title', ({ Component }) => {
    renderWithProviders(<Component />);
    const heading = screen.getAllByRole('heading', { level: 1 });
    expect(heading.length).toBeGreaterThan(0);
  });
});
