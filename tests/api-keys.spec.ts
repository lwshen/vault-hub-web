/**
 * Visual snapshot tests for the API Keys page.
 * Tests the API key list with cards and modals.
 */

import { test, expect } from '@playwright/test';
import { setupApiMocks } from './fixtures/mock-api';
import { setupTestEnvironment } from './fixtures/auth';

test.describe('API Keys Page Visual Snapshots', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authentication and theme
    await setupTestEnvironment(page);

    // Setup API mocks with default data
    await setupApiMocks(page);
  });

  test('api keys list page renders correctly', async ({ page }) => {
    // Navigate to API keys page
    await page.goto('/dashboard/api-keys');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for header to be visible
    await expect(page.locator('h1:has-text("API Keys")')).toBeVisible();

    // Wait for API key cards to render
    await expect(page.locator('text=CI/CD Pipeline Key')).toBeVisible();

    // Take full page screenshot
    await expect(page).toHaveScreenshot('api-keys-full.png', {
      fullPage: true,
    });
  });

  test('api key card renders correctly', async ({ page }) => {
    await page.goto('/dashboard/api-keys');
    await page.waitForLoadState('networkidle');

    // Wait for API key card
    const keyCard = page.locator('text=CI/CD Pipeline Key').locator('ancestor::*[contains(@class, "card")]').first();
    await expect(keyCard).toBeVisible();

    // Take screenshot of a single API key card
    await expect(keyCard).toHaveScreenshot('api-key-card.png');
  });

  test('disabled api key badge renders correctly', async ({ page }) => {
    await page.goto('/dashboard/api-keys');
    await page.waitForLoadState('networkidle');

    // Find disabled badge
    const disabledBadge = page.locator('span:has-text("Disabled")').first();
    await expect(disabledBadge).toBeVisible();

    // Take screenshot of disabled badge
    await expect(disabledBadge).toHaveScreenshot('api-key-disabled-badge.png');
  });

  test('api key metadata renders correctly', async ({ page }) => {
    await page.goto('/dashboard/api-keys');
    await page.waitForLoadState('networkidle');

    // Find metadata section (Created, Expires, Last Used)
    const metadataSection = page.locator('text=Created').first();
    await expect(metadataSection).toBeVisible();

    // Take screenshot of metadata section
    const card = metadataSection.locator('ancestor::*[contains(@class, "card")]').first();
    await expect(card).toHaveScreenshot('api-key-metadata.png');
  });

  test('new key button renders correctly', async ({ page }) => {
    await page.goto('/dashboard/api-keys');
    await page.waitForLoadState('networkidle');

    // Find the New Key button
    const newKeyButton = page.locator('button:has-text("New Key")').first();
    await expect(newKeyButton).toBeVisible();

    // Take screenshot of the button
    await expect(newKeyButton).toHaveScreenshot('api-key-new-button.png');
  });
});

test.describe('API Keys Empty State', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);

    // Setup API mocks with empty data
    await setupApiMocks(page, { apiKeys: 'empty' });
  });

  test('empty api keys state renders correctly', async ({ page }) => {
    await page.goto('/dashboard/api-keys');
    await page.waitForLoadState('networkidle');

    // Wait for empty state to be visible
    await expect(page.locator('text=No API keys')).toBeVisible();

    // Take full page screenshot
    await expect(page).toHaveScreenshot('api-keys-empty-state.png', {
      fullPage: true,
    });
  });
});