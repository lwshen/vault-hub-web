/**
 * Test data fixtures for visual snapshot tests.
 * Provides consistent mock data for all tests.
 */

import type {
  VaultLite,
  VaultAPIKey,
  AuditLog,
  AuditMetricsResponse,
  StatusResponse,
  VaultsResponse,
} from '@lwshen/vault-hub-ts-fetch-client';

/**
 * Sample vaults for testing
 */
export const sampleVaults: VaultLite[] = [
  {
    uniqueId: 'vault-001',
    name: 'Production Database',
    description: 'Main production database credentials',
    category: 'Database',
    favourite: true,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-02-20T14:45:00Z',
  },
  {
    uniqueId: 'vault-002',
    name: 'AWS Credentials',
    description: 'AWS access keys for production',
    category: 'Cloud',
    favourite: false,
    createdAt: '2025-01-20T08:15:00Z',
    updatedAt: '2025-02-18T09:30:00Z',
  },
  {
    uniqueId: 'vault-003',
    name: 'API Keys',
    description: 'Third-party API keys and secrets',
    category: 'API',
    favourite: true,
    createdAt: '2025-02-01T12:00:00Z',
    updatedAt: '2025-02-25T16:20:00Z',
  },
  {
    uniqueId: 'vault-004',
    name: 'SSH Keys',
    description: 'SSH private keys for server access',
    category: 'Infrastructure',
    favourite: false,
    createdAt: '2025-02-10T14:30:00Z',
    updatedAt: '2025-02-24T11:00:00Z',
  },
];

/**
 * Sample vaults response with pagination
 */
export const sampleVaultsResponse: VaultsResponse = {
  vaults: sampleVaults,
  totalCount: 4,
  pageSize: 10,
  pageIndex: 1,
};

/**
 * Sample API keys for testing
 */
export const sampleApiKeys: VaultAPIKey[] = [
  {
    id: 'key-001',
    name: 'CI/CD Pipeline Key',
    isActive: true,
    createdAt: new Date('2025-01-10T09:00:00Z'),
    expiresAt: new Date('2026-01-10T09:00:00Z'),
    lastUsedAt: new Date('2025-02-26T15:30:00Z'),
  },
  {
    id: 'key-002',
    name: 'Monitoring Service',
    isActive: true,
    createdAt: new Date('2025-01-25T11:45:00Z'),
    expiresAt: new Date('2025-07-25T11:45:00Z'),
    lastUsedAt: new Date('2025-02-27T10:00:00Z'),
  },
  {
    id: 'key-003',
    name: 'Deprecated Key',
    isActive: false,
    createdAt: new Date('2024-12-01T08:00:00Z'),
    expiresAt: new Date('2025-03-01T08:00:00Z'),
    lastUsedAt: new Date('2025-01-15T12:00:00Z'),
  },
];

/**
 * Sample audit logs for testing
 */
export const sampleAuditLogs: AuditLog[] = [
  {
    action: 'vault_created',
    createdAt: '2025-02-27T10:30:00Z',
    ipAddress: '192.168.1.100',
    vault: {
      uniqueId: 'vault-001',
      name: 'Production Database',
    },
  },
  {
    action: 'vault_updated',
    createdAt: '2025-02-27T09:45:00Z',
    ipAddress: '192.168.1.101',
    vault: {
      uniqueId: 'vault-002',
      name: 'AWS Credentials',
    },
    apiKey: {
      id: 'key-001',
      name: 'CI/CD Pipeline Key',
      isActive: true,
    },
  },
  {
    action: 'api_key_created',
    createdAt: '2025-02-27T08:15:00Z',
    ipAddress: '192.168.1.102',
    apiKey: {
      id: 'key-003',
      name: 'Monitoring Service',
      isActive: true,
    },
  },
  {
    action: 'user_login',
    createdAt: '2025-02-27T07:00:00Z',
    ipAddress: '192.168.1.103',
  },
  {
    action: 'vault_deleted',
    createdAt: '2025-02-26T16:20:00Z',
    ipAddress: '192.168.1.104',
    vault: {
      uniqueId: 'vault-old',
      name: 'Old Secrets',
    },
  },
];

/**
 * Sample audit metrics for testing
 */
export const sampleAuditMetrics: AuditMetricsResponse = {
  totalEventsLast30Days: 1247,
  eventsCountLast24Hours: 42,
  vaultEventsLast30Days: 856,
  apiKeyEventsLast30Days: 391,
};

/**
 * Sample status response for testing
 */
export const sampleStatus: StatusResponse = {
  systemStatus: 'healthy',
  databaseStatus: 'healthy',
  version: '1.2.3',
  commit: 'abc123def456',
};

/**
 * Sample vault detail for testing
 */
export const sampleVaultDetail = {
  uniqueId: 'vault-001',
  name: 'Production Database',
  description: 'Main production database credentials',
  category: 'Database',
  favourite: true,
  createdAt: '2025-01-15T10:30:00Z',
  updatedAt: '2025-02-20T14:45:00Z',
  value: JSON.stringify(
    {
      host: 'db.production.example.com',
      port: 5432,
      database: 'production_db',
      username: 'admin',
      password: 'super-secret-password-123',
    },
    null,
    2,
  ),
};

/**
 * Empty state fixtures
 */
export const emptyVaultsResponse: VaultsResponse = {
  vaults: [],
  totalCount: 0,
  pageSize: 10,
  pageIndex: 1,
};

export const emptyApiKeys: VaultAPIKey[] = [];

export const emptyAuditLogs: AuditLog[] = [];

/**
 * Vault filter options for audit log tests
 */
export const sampleVaultFilterOptions = sampleVaults.map((v) => ({
  uniqueId: v.uniqueId,
  name: v.name,
}));

/**
 * Sample audit logs response with pagination
 */
export const sampleAuditLogsResponse = {
  auditLogs: sampleAuditLogs,
  totalCount: 5,
};

/**
 * Empty audit logs response
 */
export const emptyAuditLogsResponse = {
  auditLogs: [],
  totalCount: 0,
};