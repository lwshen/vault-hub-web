/**
 * API mocking utilities for visual snapshot tests.
 * Intercepts API requests and returns consistent mock data.
 */

import type { Page, Route } from '@playwright/test';
import {
  sampleVaultsResponse,
  sampleApiKeys,
  sampleAuditMetrics,
  sampleStatus,
  sampleVaultDetail,
  emptyVaultsResponse,
  emptyApiKeys,
  sampleVaultFilterOptions,
  sampleAuditLogsResponse,
  emptyAuditLogsResponse,
} from './test-data';

/**
 * API endpoint patterns
 */
const API_PATTERNS = {
  // Vault endpoints
  vaults: /\/api\/vaults$/,
  vaultDetail: /\/api\/vaults\/([^/]+)$/,
  vaultValue: /\/api\/vaults\/([^/]+)\/value$/,
  vaultFilterOptions: /\/api\/vaults\/filter-options$/,

  // API Key endpoints
  apiKeys: /\/api\/api-keys$/,

  // Audit endpoints
  auditLogs: /\/api\/audit$/,
  auditMetrics: /\/api\/audit\/metrics$/,

  // Status endpoints
  status: /\/api\/status$/,

  // Config endpoint
  config: /\/api\/config$/,
};

/**
 * Mock API responses for different scenarios
 */
export const mockResponses = {
  vaults: {
    default: sampleVaultsResponse,
    empty: emptyVaultsResponse,
  },
  apiKeys: {
    default: sampleApiKeys,
    empty: emptyApiKeys,
  },
  auditLogs: {
    default: sampleAuditLogsResponse,
    empty: emptyAuditLogsResponse,
  },
  auditMetrics: {
    default: sampleAuditMetrics,
  },
  status: {
    default: sampleStatus,
  },
  vaultDetail: {
    default: sampleVaultDetail,
  },
  vaultFilterOptions: {
    default: { vaults: sampleVaultFilterOptions },
  },
  config: {
    default: {
      oidcEnabled: false,
      emailAuthEnabled: true,
    },
  },
};

/**
 * Handles vaults API request
 */
async function handleVaultsRequest(route: Route, scenario: 'default' | 'empty' = 'default') {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockResponses.vaults[scenario]),
  });
}

/**
 * Handles vault detail API request
 */
async function handleVaultDetailRequest(route: Route, vaultId: string) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      ...mockResponses.vaultDetail.default,
      uniqueId: vaultId,
    }),
  });
}

/**
 * Handles API keys request
 */
async function handleApiKeysRequest(route: Route, scenario: 'default' | 'empty' = 'default') {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockResponses.apiKeys[scenario]),
  });
}

/**
 * Handles audit logs request
 */
async function handleAuditLogsRequest(route: Route, scenario: 'default' | 'empty' = 'default') {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockResponses.auditLogs[scenario]),
  });
}

/**
 * Handles audit metrics request
 */
async function handleAuditMetricsRequest(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockResponses.auditMetrics.default),
  });
}

/**
 * Handles status request
 */
async function handleStatusRequest(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockResponses.status.default),
  });
}

/**
 * Handles vault filter options request
 */
async function handleVaultFilterOptionsRequest(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockResponses.vaultFilterOptions.default),
  });
}

/**
 * Handles config request
 */
async function handleConfigRequest(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockResponses.config.default),
  });
}

/**
 * Options for setting up API mocks
 */
export interface MockApiOptions {
  /** Scenario for vaults (default: 'default') */
  vaults?: 'default' | 'empty';
  /** Scenario for API keys (default: 'default') */
  apiKeys?: 'default' | 'empty';
  /** Scenario for audit logs (default: 'default') */
  auditLogs?: 'default' | 'empty';
}

/**
 * Sets up API mocking for a page with specified scenarios
 */
export async function setupApiMocks(page: Page, options: MockApiOptions = {}) {
  const { vaults = 'default', apiKeys = 'default', auditLogs = 'default' } = options;

  // Mock vaults endpoint
  await page.route(API_PATTERNS.vaults, async (route) => {
    await handleVaultsRequest(route, vaults);
  });

  // Mock vault detail endpoint
  await page.route(API_PATTERNS.vaultDetail, async (route) => {
    const match = route.request().url().match(API_PATTERNS.vaultDetail);
    const vaultId = match?.[1] || 'vault-001';
    await handleVaultDetailRequest(route, vaultId);
  });

  // Mock vault value endpoint
  await page.route(API_PATTERNS.vaultValue, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ value: mockResponses.vaultDetail.default.value }),
    });
  });

  // Mock vault filter options endpoint
  await page.route(API_PATTERNS.vaultFilterOptions, async (route) => {
    await handleVaultFilterOptionsRequest(route);
  });

  // Mock API keys endpoint
  await page.route(API_PATTERNS.apiKeys, async (route) => {
    await handleApiKeysRequest(route, apiKeys);
  });

  // Mock audit logs endpoint
  await page.route(API_PATTERNS.auditLogs, async (route) => {
    await handleAuditLogsRequest(route, auditLogs);
  });

  // Mock audit metrics endpoint
  await page.route(API_PATTERNS.auditMetrics, async (route) => {
    await handleAuditMetricsRequest(route);
  });

  // Mock status endpoint
  await page.route(API_PATTERNS.status, async (route) => {
    await handleStatusRequest(route);
  });

  // Mock config endpoint
  await page.route(API_PATTERNS.config, async (route) => {
    await handleConfigRequest(route);
  });
}

/**
 * Clears all API mocks from a page
 */
export async function clearApiMocks(page: Page) {
  await page.unrouteAll();
}