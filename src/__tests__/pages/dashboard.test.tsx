import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test-utils';
import Dashboard from '@/pages/dashboard/dashboard';
import Vaults from '@/pages/dashboard/vaults';
import VaultDetail from '@/pages/dashboard/vault-detail';
import ApiKeys from '@/pages/dashboard/api-keys';
import AuditLog from '@/pages/dashboard/audit-log';

vi.mock('@/apis/api', () => ({
  authApi: {},
  userApi: { getCurrentUser: vi.fn() },
  vaultApi: {
    getVaults: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getVault: vi.fn().mockResolvedValue({ id: 'v1', name: 'test', entries: [] }),
  },
  auditApi: {
    getAuditLogs: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getMetrics: vi.fn().mockResolvedValue({}),
  },
  apiKeyApi: {
    getApiKeys: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  },
  statusApi: {},
  configApi: {},
}));

vi.mock('@/hooks/use-app-config', () => ({
  default: () => ({
    config: { oidcEnabled: false, emailEnabled: true },
    isLoading: false,
  }),
}));

vi.mock('@/components/layout/dashboard-layout', () => ({
  default: ({ children }: { children: React.ReactNode; }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

vi.mock('@/components/dashboard/dashboard-content', () => ({
  default: () => <div data-testid="dashboard-content">Dashboard Content</div>,
}));

vi.mock('@/components/dashboard/vaults-content', () => ({
  default: () => <div data-testid="vaults-content">Vaults Content</div>,
}));

vi.mock('@/components/dashboard/vault-detail-content', () => ({
  default: ({ vaultId }: { vaultId: string; }) => (
    <div data-testid="vault-detail-content">Vault Detail: {vaultId}</div>
  ),
}));

vi.mock('@/components/dashboard/api-keys-content', () => ({
  default: () => <div data-testid="api-keys-content">API Keys Content</div>,
}));

vi.mock('@/components/dashboard/audit-log-content', () => ({
  default: () => <div data-testid="audit-log-content">Audit Log Content</div>,
}));

describe('Dashboard Pages Snapshots', () => {
  it('Dashboard page matches snapshot', () => {
    const { container } = renderWithProviders(<Dashboard />, { authenticated: true });
    expect(container).toMatchSnapshot();
  });

  it('Vaults page matches snapshot', () => {
    const { container } = renderWithProviders(<Vaults />, { authenticated: true });
    expect(container).toMatchSnapshot();
  });

  it('VaultDetail page matches snapshot', () => {
    const { container } = renderWithProviders(<VaultDetail vaultId="test-vault-123" />, { authenticated: true });
    expect(container).toMatchSnapshot();
  });

  it('ApiKeys page matches snapshot', () => {
    const { container } = renderWithProviders(<ApiKeys />, { authenticated: true });
    expect(container).toMatchSnapshot();
  });

  it('AuditLog page matches snapshot', () => {
    const { container } = renderWithProviders(<AuditLog />, { authenticated: true });
    expect(container).toMatchSnapshot();
  });
});
