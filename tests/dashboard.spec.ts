/**
 * Visual snapshot tests for the Dashboard page.
 * Tests the main dashboard with stats, recent vaults, system status, and audit logs.
 */

import { test, expect } from '@playwright/test';
import { setupApiMocks } from './fixtures/mock-api';
import { setupTestEnvironment } from './fixtures/auth';

test.describe('Dashboard Page Visual Snapshots', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authentication and theme
    await setupTestEnvironment(page);

    // Setup API mocks
    await setupApiMocks(page);
  });

  test('dashboard page renders correctly', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for content to render
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

    // Wait for stats to load
    await expect(page.locator('text=Total Events (30 days)')).toBeVisible();

    // Wait for system status section
    await expect(page.locator('text=System Status')).toBeVisible();

    // Take full page screenshot
    await expect(page).toHaveScreenshot('dashboard-full.png', {
      fullPage: true,
    });
  });

  test('dashboard stats grid renders correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for stats to load
    const statsGrid = page.locator('.grid').first();
    await expect(statsGrid).toBeVisible();

    // Take screenshot of stats section
    await expect(statsGrid).toHaveScreenshot('dashboard-stats-grid.png');
  });

  test('recent vaults section renders correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for recent vaults section
    const recentVaultsCard = page.locator('text=Recent Vaults').locator('..');
    await expect(recentVaultsCard).toBeVisible();

    // Take screenshot of recent vaults
    await expect(recentVaultsCard).toHaveScreenshot('dashboard-recent-vaults.png');
  });

  test('system status section renders correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for system status section
    const systemStatusCard = page.locator('text=System Status').locator('..');
    await expect(systemStatusCard).toBeVisible();

    // Take screenshot of system status
    await expect(systemStatusCard).toHaveScreenshot('dashboard-system-status.png');
  });

  test('recent audit logs section renders correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for audit logs section
    const auditLogsCard = page.locator('text=Recent Audit Logs').locator('..');
    await expect(auditLogsCard).toBeVisible();

    // Take screenshot of audit logs
    await expect(auditLogsCard).toHaveScreenshot('dashboard-recent-audit-logs.png');
  });
});