/**
 * Visual snapshot tests for the Vault Detail page.
 * Tests the vault value viewer/editor with metadata.
 */

import { test, expect } from '@playwright/test';
import { setupApiMocks } from './fixtures/mock-api';
import { setupTestEnvironment } from './fixtures/auth';

test.describe('Vault Detail Page Visual Snapshots', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authentication and theme
    await setupTestEnvironment(page);

    // Setup API mocks
    await setupApiMocks(page);
  });

  test('vault detail page renders correctly in view mode', async ({ page }) => {
    // Navigate to vault detail page
    await page.goto('/dashboard/vaults/vault-001');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for vault name to be visible
    await expect(page.locator('text=Production Database')).toBeVisible();

    // Take full page screenshot
    await expect(page).toHaveScreenshot('vault-detail-view-full.png', {
      fullPage: true,
    });
  });

  test('vault metadata section renders correctly', async ({ page }) => {
    await page.goto('/dashboard/vaults/vault-001');
    await page.waitForLoadState('networkidle');

    // Wait for metadata section
    const metadataSection = page.locator('text=Properties').locator('ancestor::*[contains(@class, "card")]').first();
    await expect(metadataSection).toBeVisible();

    // Take screenshot of metadata
    await expect(metadataSection).toHaveScreenshot('vault-detail-metadata.png');
  });

  test('vault value viewer renders correctly', async ({ page }) => {
    await page.goto('/dashboard/vaults/vault-001');
    await page.waitForLoadState('networkidle');

    // Wait for value section
    const valueSection = page.locator('text=Value').locator('ancestor::*[contains(@class, "card")]').first();
    await expect(valueSection).toBeVisible();

    // Take screenshot of value viewer
    await expect(valueSection).toHaveScreenshot('vault-detail-value-viewer.png');
  });

  test('vault detail header renders correctly', async ({ page }) => {
    await page.goto('/dashboard/vaults/vault-001');
    await page.waitForLoadState('networkidle');

    // Wait for header with vault name
    const header = page.locator('header, [class*="header"]').first();
    await expect(header).toBeVisible();

    // Take screenshot of header
    await expect(header).toHaveScreenshot('vault-detail-header.png');
  });
});

test.describe('Vault Detail Edit Mode', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
    await setupApiMocks(page);
  });

  test('vault detail page in edit mode', async ({ page }) => {
    // Navigate to vault detail page in edit mode
    await page.goto('/dashboard/vaults/vault-001?mode=edit');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for vault name to be visible
    await expect(page.locator('text=Production Database')).toBeVisible();

    // Take full page screenshot
    await expect(page).toHaveScreenshot('vault-detail-edit-full.png', {
      fullPage: true,
    });
  });

  test('edit mode toolbar renders correctly', async ({ page }) => {
    await page.goto('/dashboard/vaults/vault-001?mode=edit');
    await page.waitForLoadState('networkidle');

    // Wait for save/cancel buttons to appear
    const saveButton = page.locator('button:has-text("Save")');
    await expect(saveButton).toBeVisible();

    // Take screenshot of the edit toolbar
    const toolbar = saveButton.locator('ancestor::*[contains(@class, "flex")]').first();
    await expect(toolbar).toHaveScreenshot('vault-detail-edit-toolbar.png');
  });
});