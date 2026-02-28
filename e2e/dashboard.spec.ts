import { test, expect } from "@playwright/test";

test.describe("Dashboard Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    // Mock user endpoint to bypass auth
    await page.route("**/api/user", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-user-id",
          username: "testuser",
          email: "test@example.com",
          createdAt: "2024-01-01T00:00:00Z",
        }),
      });
    });

    // Mock status endpoint
    await page.route("**/api/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          systemStatus: "healthy",
          databaseStatus: "healthy",
          version: "1.0.0",
          commit: "abc1234",
        }),
      });
    });

    // Mock audit metrics endpoint
    await page.route("**/api/audit/metrics", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totalEventsLast30Days: 150,
          eventsCountLast24Hours: 25,
          vaultEventsLast30Days: 80,
          apiKeyEventsLast30Days: 70,
        }),
      });
    });

    // Mock audit logs endpoint
    await page.route("**/api/audit/logs", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          auditLogs: [
            {
              id: "log-1",
              action: "vault_access",
              createdAt: new Date().toISOString(),
              vault: { id: "v1", uniqueId: "v-1", name: "Test Vault" },
            },
            {
              id: "log-2",
              action: "vault_create",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              vault: { id: "v2", uniqueId: "v-2", name: "Production Vault" },
            },
            {
              id: "log-3",
              action: "api_key_create",
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              apiKey: { id: "key-1", name: "Dev Key" },
            },
          ],
          total: 3,
        }),
      });
    });

    // Mock vaults endpoint
    await page.route("**/api/vaults", async (route) => {
      const url = new URL(route.request().url());
      const pageSize = url.searchParams.get("pageSize") || "10";
      const pageIndex = url.searchParams.get("pageIndex") || "0";

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "1",
              uniqueId: "vault-1",
              name: "Production Secrets",
              category: "Development",
              favourite: true,
              createdAt: "2024-01-15T10:00:00Z",
              updatedAt: new Date().toISOString(),
            },
            {
              id: "2",
              uniqueId: "vault-2",
              name: "API Credentials",
              category: "Production",
              favourite: false,
              createdAt: "2024-01-10T10:00:00Z",
              updatedAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
          total: 2,
          pageSize: parseInt(pageSize),
          pageIndex: parseInt(pageIndex),
        }),
      });
    });

    // Set token in localStorage to bypass auth
    await page.addInitScript(() => {
      localStorage.setItem("token", "test-mock-token");
    });
  });

  test("dashboard matches baseline screenshot", async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard");

    // Wait for content to load
    await page.waitForSelector("text=Dashboard", { timeout: 10000 });

    // Wait for the stats cards to load
    await page.waitForSelector("text=Total Events (30 days)", { timeout: 10000 });

    // Wait a bit for any animations to complete
    await page.waitForTimeout(1000);

    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot("dashboard.png", {
      maxDiffPixelRatio: 0.1,
    });
  });
});