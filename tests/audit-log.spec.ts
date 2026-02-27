/**
 * Visual snapshot tests for the Audit Log page.
 * Tests the audit logs with filters, stats, and pagination.
 */

import { test, expect } from '@playwright/test';
import { setupApiMocks } from './fixtures/mock-api';
import { setupTestEnvironment } from './fixtures/auth';

test.describe('Audit Log Page Visual Snapshots', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authentication and theme
    await setupTestEnvironment(page);

    // Setup API mocks with default data
    await setupApiMocks(page);
  });

  test('audit log page renders correctly', async ({ page }) => {
    // Navigate to audit log page
    await page.goto('/dashboard/audit-log');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for header to be visible
    await expect(page.locator('h1:has-text("Audit Log")')).toBeVisible();

    // Wait for stats to render
    await expect(page.locator('text=Total Events')).toBeVisible();

    // Take full page screenshot
    await expect(page).toHaveScreenshot('audit-log-full.png', {
      fullPage: true,
    });
  });

  test('audit stats grid renders correctly', async ({ page }) => {
    await page.goto('/dashboard/audit-log');
    await page.waitForLoadState('networkidle');

    // Wait for stats to load
    const statsGrid = page.locator('text=Total Events').locator('ancestor::*[contains(@class, "grid")]').first();
    await expect(statsGrid).toBeVisible();

    // Take screenshot of stats section
    await expect(statsGrid).toHaveScreenshot('audit-log-stats.png');
  });

  test('audit log table renders correctly', async ({ page }) => {
    await page.goto('/dashboard/audit-log');
    await page.waitForLoadState('networkidle');

    // Wait for table to render
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // Take screenshot of table
    await expect(table).toHaveScreenshot('audit-log-table.png');
  });

  test('audit log filters render correctly', async ({ page }) => {
    await page.goto('/dashboard/audit-log');
    await page.waitForLoadState('networkidle');

    // Wait for filters section
    const filtersSection = page.locator('text=Filters').locator('ancestor::*[contains(@class, "flex")]').first();
    await expect(filtersSection).toBeVisible();

    // Take screenshot of filters
    await expect(filtersSection).toHaveScreenshot('audit-log-filters.png');
  });

  test('vault filter combobox renders correctly', async ({ page }) => {
    await page.goto('/dashboard/audit-log');
    await page.waitForLoadState('networkidle');

    // Find the vault filter (combobox)
    const vaultFilter = page.locator('[role="combobox"], button:has-text("All Vaults")').first();
    await expect(vaultFilter).toBeVisible();

    // Take screenshot of vault filter
    await expect(vaultFilter).toHaveScreenshot('audit-log-vault-filter.png');
  });

  test('source filter select renders correctly', async ({ page }) => {
    await page.goto('/dashboard/audit-log');
    await page.waitForLoadState('networkidle');

    // Find the source filter
    const sourceFilter = page.locator('button:has-text("All Sources")').first();
    await expect(sourceFilter).toBeVisible();

    // Take screenshot of source filter
    await expect(sourceFilter).toHaveScreenshot('audit-log-source-filter.png');
  });

  test('action icons render correctly', async ({ page }) => {
    await page.goto('/dashboard/audit-log');
    await page.waitForLoadState('networkidle');

    // Find the table row with action icons
    const tableBody = page.locator('tbody').first();
    await expect(tableBody).toBeVisible();

    // Take screenshot of table rows with icons
    await expect(tableBody).toHaveScreenshot('audit-log-action-icons.png');
  });

  test('pagination controls render correctly', async ({ page }) => {
    await page.goto('/dashboard/audit-log');
    await page.waitForLoadState('networkidle');

    // Find pagination controls (if visible)
    const pagination = page.locator('nav[aria-label*="pagination"], [class*="pagination"]').first();

    // Only take screenshot if pagination exists
    if (await pagination.isVisible()) {
      await expect(pagination).toHaveScreenshot('audit-log-pagination.png');
    }
  });
});

test.describe('Audit Log Empty State', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);

    // Setup API mocks with empty data
    await setupApiMocks(page, { auditLogs: 'empty' });
  });

  test('empty audit log state renders correctly', async ({ page }) => {
    await page.goto('/dashboard/audit-log');
    await page.waitForLoadState('networkidle');

    // Wait for empty state to be visible
    await expect(page.locator('text=No audit logs found')).toBeVisible();

    // Take full page screenshot
    await expect(page).toHaveScreenshot('audit-log-empty-state.png', {
      fullPage: true,
    });
  });
});