import { AuditLogActionEnum } from '@lwshen/vault-hub-ts-fetch-client';
import { render, screen } from '@testing-library/react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PATH } from '@/const/path';
import Dashboard from '@/pages/dashboard/dashboard';

const {
  fetchVaultsMock,
  getStatusMock,
  getAuditMetricsMock,
  getAuditLogsMock,
} = vi.hoisted(() => ({
  fetchVaultsMock: vi.fn(),
  getStatusMock: vi.fn(),
  getAuditMetricsMock: vi.fn(),
  getAuditLogsMock: vi.fn(),
}));

vi.mock('@/stores/vault-store', () => ({
  useVaultStore: () => ({
    vaults: [
      {
        uniqueId: 'vault-prod',
        name: 'Production DB',
        favourite: true,
        category: 'database',
        updatedAt: '2026-02-26T10:00:00.000Z',
      },
      {
        uniqueId: 'vault-staging',
        name: 'Staging API',
        favourite: false,
        category: 'api',
        updatedAt: '2026-02-26T09:00:00.000Z',
      },
    ],
    isLoading: false,
    fetchVaults: fetchVaultsMock,
  }),
}));

vi.mock('@/apis/api', () => ({
  statusApi: {
    getStatus: getStatusMock,
  },
  auditApi: {
    getAuditMetrics: getAuditMetricsMock,
    getAuditLogs: getAuditLogsMock,
  },
}));

vi.mock('@/utils/audit-log', async () => {
  const actual = await vi.importActual<typeof import('@/utils/audit-log')>('@/utils/audit-log');

  return {
    ...actual,
    formatTimestamp: () => 'fixed-time',
  };
});

const renderDashboard = () => {
  const { hook, searchHook } = memoryLocation({ path: PATH.DASHBOARD });

  return render(
    <Router hook={hook} searchHook={searchHook}>
      <Dashboard />
    </Router>,
  );
};

describe('Dashboard page consistency', () => {
  beforeEach(() => {
    fetchVaultsMock.mockResolvedValue(undefined);
    getStatusMock.mockResolvedValue({
      systemStatus: 'healthy',
      databaseStatus: 'healthy',
      version: '1.2.3',
      commit: 'abc1234',
    });
    getAuditMetricsMock.mockResolvedValue({
      totalEventsLast30Days: 42,
      eventsCountLast24Hours: 8,
      vaultEventsLast30Days: 20,
      apiKeyEventsLast30Days: 14,
    });
    getAuditLogsMock.mockResolvedValue({
      auditLogs: [
        {
          action: AuditLogActionEnum.CreateVault,
          createdAt: '2026-02-26T11:30:00.000Z',
          vault: {
            uniqueId: 'vault-prod',
            name: 'Production DB',
          },
          apiKey: null,
        },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('matches a stable dashboard snapshot with representative data', async () => {
    const { container } = renderDashboard();

    expect(await screen.findByText('Manage your vaults and monitor activity')).toBeInTheDocument();
    expect(await screen.findByText('1.2.3')).toBeInTheDocument();
    expect(screen.getByText('Production DB')).toBeInTheDocument();
    expect(screen.getByText('Vault created (Production DB)')).toBeInTheDocument();

    expect(fetchVaultsMock).toHaveBeenCalledTimes(1);
    expect(getStatusMock).toHaveBeenCalledTimes(1);
    expect(getAuditMetricsMock).toHaveBeenCalledTimes(1);
    expect(getAuditLogsMock).toHaveBeenCalledWith(5, 1);
    expect(container.firstChild).toMatchSnapshot();
  });
});
