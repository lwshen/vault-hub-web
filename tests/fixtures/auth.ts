/**
 * Authentication helpers for visual snapshot tests.
 * Handles login state and token management for protected routes.
 */

import type { Page, BrowserContext } from '@playwright/test';

/**
 * Storage state for authenticated sessions
 */
export const AUTH_STORAGE_KEY = 'token';

/**
 * Test user credentials (mock - not actually validated against backend)
 */
export const TEST_USER = {
  email: 'test@example.com',
  token: 'test-jwt-token-mock-value',
};

/**
 * Sets up authentication state in localStorage
 */
export async function setAuthState(page: Page, token: string = TEST_USER.token) {
  await page.addInitScript((tokenValue) => {
    localStorage.setItem('token', tokenValue);
  }, token);
}

/**
 * Sets up authentication state using localStorage directly
 * Call this after page.goto() if addInitScript wasn't used
 */
export async function authenticatePage(page: Page, token: string = TEST_USER.token) {
  await page.evaluate((tokenValue) => {
    localStorage.setItem('token', tokenValue);
  }, token);
}

/**
 * Clears authentication state
 */
export async function clearAuthState(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('token');
  });
}

/**
 * Creates an authenticated browser context
 */
export async function createAuthenticatedContext(context: BrowserContext) {
  await context.addCookies([
    {
      name: 'auth',
      value: 'true',
      domain: 'localhost',
      path: '/',
    },
  ]);
}

/**
 * Sets the theme in localStorage
 */
export async function setTheme(page: Page, theme: 'light' | 'dark' | 'system' = 'light') {
  await page.evaluate((themeValue) => {
    localStorage.setItem('theme', themeValue);
  }, theme);
}

/**
 * Setup complete test environment with authentication and theme
 */
export async function setupTestEnvironment(
  page: Page,
  options: {
    theme?: 'light' | 'dark' | 'system';
    token?: string;
  } = {},
) {
  const { theme = 'light', token = TEST_USER.token } = options;

  // Set up authentication before page loads
  await setAuthState(page, token);
  await setTheme(page, theme);
}