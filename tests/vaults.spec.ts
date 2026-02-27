/**
 * Visual snapshot tests for the Vaults list page.
 * Tests the vaults list with pagination, cards, and modals.
 */

import { test, expect } from '@playwright/test';
import { setupApiMocks } from './fixtures/mock-api';
import { setupTestEnvironment } from './fixtures/auth';

test.describe('Vaults Page Visual Snapshots', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authentication and theme
    await setupTestEnvironment(page);

    // Setup API mocks with default data
    await setupApiMocks(page);
  });

  test('vaults list page renders correctly', async ({ page }) => {
    // Navigate to vaults page
    await page.goto('/dashboard/vaults');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for header to be visible
    await expect(page.locator('h1:has-text("Vaults")')).toBeVisible();

    // Wait for vault cards to render
    await expect(page.locator('text=Production Database')).toBeVisible();

    // Take full page screenshot
    await expect(page).toHaveScreenshot('vaults-full.png', {
      fullPage: true,
    });
  });

  test('vault cards render correctly', async ({ page }) => {
    await page.goto('/dashboard/vaults');
    await page.waitForLoadState('networkidle');

    // Wait for vault cards
    const vaultCard = page.locator('text=Production Database').locator('ancestor::*[contains(@class, "card")]').first();
    await expect(vaultCard).toBeVisible();

    // Take screenshot of a single vault card
    await expect(vaultCard).toHaveScreenshot('vault-card.png');
  });

  test('favourite vault badge renders correctly', async ({ page }) => {
    await page.goto('/dashboard/vaults');
    await page.waitForLoadState('networkidle');

    // Find vault with favourite badge
    const favouriteBadge = page.locator('span:has-text("Favourite")').first();
    await expect(favouriteBadge).toBeVisible();

    // Take screenshot of favourite badge
    await expect(favouriteBadge).toHaveScreenshot('vault-favourite-badge.png');
  });

  test('category tag renders correctly', async ({ page }) => {
    await page.goto('/dashboard/vaults');
    await page.waitForLoadState('networkidle');

    // Find category tag
    const categoryTag = page.locator('span:has-text("Database")').first();
    await expect(categoryTag).toBeVisible();

    // Take screenshot of category tag
    await expect(categoryTag).toHaveScreenshot('vault-category-tag.png');
  });

  test('pagination controls render correctly', async ({ page }) => {
    await page.goto('/dashboard/vaults');
    await page.waitForLoadState('networkidle');

    // Find pagination controls (if visible)
    const pagination = page.locator('nav[aria-label*="pagination"], [class*="pagination"]').first();

    // Only take screenshot if pagination exists
    if (await pagination.isVisible()) {
      await expect(pagination).toHaveScreenshot('vaults-pagination.png');
    }
  });
});

test.describe('Vaults Empty State', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);

    // Setup API mocks with empty data
    await setupApiMocks(page, { vaults: 'empty' });
  });

  test('empty vaults state renders correctly', async ({ page }) => {
    await page.goto('/dashboard/vaults');
    await page.waitForLoadState('networkidle');

    // Wait for empty state to be visible
    await expect(page.locator('text=No vaults found')).toBeVisible();

    // Take full page screenshot
    await expect(page).toHaveScreenshot('vaults-empty-state.png', {
      fullPage: true,
    });
  });
});