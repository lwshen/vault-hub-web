/**
 * Dashboard page cross-comparison tests.
 *
 * Instead of testing each page individually, these tests render every dashboard
 * page in the same suite and compare the structural signatures they produce.
 * Any page that diverges from the shared layout contract will fail here.
 *
 * Structural contract verified:
 *  1. Root layout wrapper — identical CSS classes (DashboardLayout)
 *  2. Sidebar panel     — identical CSS classes + identical nav items (label, href, order)
 *  3. Content area      — identical CSS classes on the flex column container
 *  4. Page header       — uses a <header> element with identical container classes
 *  5. h1 heading        — exactly one per page; non-empty text
 *  6. Nav active state  — exactly one nav item is visually active per page
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { AuthContext, type AuthContextType } from '@/contexts/auth-context';
import type { ReactNode } from 'react';

// ─── Mocks (identical to dashboard-pages.test.tsx) ───────────────────────────

vi.mock('@/apis/api', () => ({
  authApi: { login: vi.fn(), signup: vi.fn(), logout: vi.fn() },
  userApi: { getCurrentUser: vi.fn() },
  vaultApi: {
    getVaults: vi.fn().mockResolvedValue({ vaults: [], totalCount: 0, pageIndex: 1, pageSize: 10 }),
    deleteVault: vi.fn(),
    updateVault: vi.fn(),
    getVault: vi.fn().mockResolvedValue({ uniqueId: '1', name: 'Test Vault', value: '' }),
  },
  auditApi: {
    getAuditLogs: vi.fn().mockResolvedValue({ auditLogs: [], total: 0 }),
    getAuditMetrics: vi.fn().mockResolvedValue({
      totalEventsLast30Days: 0,
      eventsCountLast24Hours: 0,
      vaultEventsLast30Days: 0,
      apiKeyEventsLast30Days: 0,
    }),
  },
  apiKeyApi: {
    getApiKeys: vi.fn().mockResolvedValue({ apiKeys: [], total: 0 }),
    deleteApiKey: vi.fn(),
    createApiKey: vi.fn(),
  },
  statusApi: {
    getStatus: vi.fn().mockResolvedValue({
      systemStatus: 'healthy',
      databaseStatus: 'healthy',
      version: '1.0.0',
      commit: 'abc1234',
    }),
  },
  configApi: {
    getConfig: vi.fn().mockResolvedValue({ oidcEnabled: false, emailEnabled: true, demoEnabled: false }),
  },
}));

vi.mock('@/stores/vault-store', () => ({
  useVaultStore: vi.fn(() => ({
    vaults: [],
    isLoading: false,
    error: null,
    isDeleting: false,
    totalCount: 0,
    totalPages: 0,
    pageSize: 10,
    pageIndex: 1,
    fetchVaults: vi.fn().mockResolvedValue(undefined),
    deleteVault: vi.fn().mockResolvedValue(undefined),
    setPageIndex: vi.fn(),
    setPageSize: vi.fn(),
    clearError: vi.fn(),
    reset: vi.fn(),
  })),
}));

vi.mock('@/stores/api-key-store', () => ({
  useApiKeyStore: vi.fn(() => ({
    apiKeys: [],
    isLoading: false,
    error: null,
    fetchApiKeys: vi.fn().mockResolvedValue(undefined),
    deleteApiKey: vi.fn().mockResolvedValue(undefined),
    clearError: vi.fn(),
    reset: vi.fn(),
  })),
}));

vi.mock('@/stores/audit-store', () => ({
  useAuditLogStore: vi.fn(() => ({
    auditLogs: [],
    metrics: null,
    vaultFilterOptions: [],
    isLoading: false,
    metricsLoading: false,
    vaultFilterOptionsLoading: false,
    error: null,
    currentPage: 1,
    totalCount: 0,
    totalPages: 0,
    pageSize: 20,
    vaultFilter: null,
    sourceFilter: 'all',
    fetchAuditLogs: vi.fn().mockResolvedValue(undefined),
    fetchMetrics: vi.fn().mockResolvedValue(undefined),
    fetchVaultFilterOptions: vi.fn().mockResolvedValue(undefined),
    setPageSize: vi.fn(),
    setCurrentPage: vi.fn(),
    setVaultFilter: vi.fn(),
    setSourceFilter: vi.fn(),
    clearFilters: vi.fn(),
    clearError: vi.fn(),
    reset: vi.fn(),
  })),
}));

vi.mock('wouter', () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
  useLocation: () => ['/dashboard', vi.fn()],
  useRoute: () => [false, {}],
  Route: ({ children }: { children: ReactNode }) => children,
  Switch: ({ children }: { children: ReactNode }) => children,
  navigate: vi.fn(),
}));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import Dashboard from '@/pages/dashboard/dashboard';
import Vaults from '@/pages/dashboard/vaults';
import ApiKeys from '@/pages/dashboard/api-keys';
import AuditLog from '@/pages/dashboard/audit-log';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockAuth: AuthContextType = {
  isAuthenticated: true,
  user: { id: 'u1', email: 'test@example.com', name: 'Test User', createdAt: '', updatedAt: '' },
  isLoading: false,
  login: vi.fn(),
  loginWithOidc: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  requestMagicLink: vi.fn(),
  requestPasswordReset: vi.fn(),
  authenticateWithToken: vi.fn(),
};

function renderPage(ui: ReactNode) {
  const { container } = render(
    <AuthContext.Provider value={mockAuth}>{ui}</AuthContext.Provider>,
  );
  return container;
}

/** Normalises a classList so the order of classes never affects the comparison. */
function sortedClasses(el: Element): string {
  return Array.from(el.classList).sort().join(' ');
}

interface SidebarSignature {
  panelClasses: string;
  navItemCount: number;
  navItems: Array<{ label: string; href: string }>;
}

interface HeaderSignature {
  tag: string;
  containerClasses: string;
  hasH1: boolean;
  h1Text: string;
}

interface PageSignature {
  rootClasses: string;
  contentAreaClasses: string;
  sidebar: SidebarSignature;
  header: HeaderSignature;
  h1Count: number;
  activeNavItemCount: number;
}

/**
 * Extracts the structural signature of a rendered dashboard page for cross-page comparison.
 */
function extractPageSignature(container: HTMLElement): PageSignature {
  // 1. Root layout wrapper (first child of the render container)
  const root = container.firstElementChild as HTMLElement;

  // 2. Sidebar panel (first child of root)
  const sidebarPanel = root.firstElementChild as HTMLElement;
  const nav = sidebarPanel.querySelector('nav')!;
  const navLinks = Array.from(nav.querySelectorAll('a'));
  const navItems = navLinks.map((a) => ({
    href: a.getAttribute('href') ?? '',
    label: (a.querySelector('button')?.textContent ?? '').trim(),
  }));
  const activeNavItems = navLinks.filter((a) =>
    a.querySelector('button')?.className.includes('bg-primary/10'),
  );

  // 3. Content area (second child of root)
  const contentArea = root.children[1] as HTMLElement;

  // 4. Page header (first child of content area)
  const headerEl = contentArea.firstElementChild as HTMLElement;
  const h1El = headerEl.querySelector('h1');

  // 5. All h1 elements in the entire page
  const allH1s = container.querySelectorAll('h1');

  return {
    rootClasses: sortedClasses(root),
    contentAreaClasses: sortedClasses(contentArea),
    sidebar: {
      panelClasses: sortedClasses(sidebarPanel),
      navItemCount: navItems.length,
      navItems,
    },
    header: {
      tag: headerEl.tagName.toLowerCase(),
      containerClasses: sortedClasses(headerEl),
      hasH1: !!h1El,
      h1Text: h1El?.textContent?.trim() ?? '',
    },
    h1Count: allH1s.length,
    activeNavItemCount: activeNavItems.length,
  };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

const PAGES = [
  { name: 'Dashboard', component: <Dashboard /> },
  { name: 'Vaults', component: <Vaults /> },
  { name: 'API Keys', component: <ApiKeys /> },
  { name: 'Audit Log', component: <AuditLog /> },
] as const;

/** Signatures keyed by page name, built once before all tests run. */
const signatures: Record<string, PageSignature> = {};

beforeAll(() => {
  for (const { name, component } of PAGES) {
    signatures[name] = extractPageSignature(renderPage(component));
  }
});

// ─── 1. Root layout wrapper ───────────────────────────────────────────────────

describe('Root layout wrapper', () => {
  it('all pages share the same root CSS classes (DashboardLayout)', () => {
    const rootClasses = PAGES.map(({ name }) => signatures[name].rootClasses);
    const unique = new Set(rootClasses);
    expect(
      unique.size,
      `Expected all pages to have the same root classes.\nDifferences:\n${
        PAGES.map(({ name }) => `  ${name}: "${signatures[name].rootClasses}"`).join('\n')
      }`,
    ).toBe(1);
  });

  it('root wrapper uses the expected layout classes', () => {
    const { rootClasses } = signatures['Dashboard'];
    expect(rootClasses).toContain('flex');
    expect(rootClasses).toContain('overflow-hidden');
  });
});

// ─── 2. Sidebar panel ─────────────────────────────────────────────────────────

describe('Sidebar panel', () => {
  it('all pages render a sidebar with identical CSS classes', () => {
    const panelClasses = PAGES.map(({ name }) => signatures[name].sidebar.panelClasses);
    const unique = new Set(panelClasses);
    expect(
      unique.size,
      `Expected all pages to have the same sidebar panel classes.\nDifferences:\n${
        PAGES.map(({ name }) => `  ${name}: "${signatures[name].sidebar.panelClasses}"`).join('\n')
      }`,
    ).toBe(1);
  });

  it('all pages have the same number of sidebar navigation items', () => {
    const counts = PAGES.map(({ name }) => signatures[name].sidebar.navItemCount);
    const unique = new Set(counts);
    expect(
      unique.size,
      `Nav item counts differ across pages: ${
        PAGES.map(({ name }) => `${name}=${signatures[name].sidebar.navItemCount}`).join(', ')
      }`,
    ).toBe(1);
  });
});

// ─── 3. Sidebar nav items — label and href order ──────────────────────────────

describe('Sidebar nav items', () => {
  const EXPECTED_NAV: Array<{ label: string; href: string }> = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Vaults', href: '/dashboard/vaults' },
    { label: 'API Keys', href: '/dashboard/api-keys' },
    { label: 'Audit Log', href: '/dashboard/audit-log' },
  ];

  it.each(PAGES)('$name nav items match the expected labels and hrefs in order', ({ name }) => {
    expect(signatures[name].sidebar.navItems).toEqual(EXPECTED_NAV);
  });

  it('nav items are identical across all pages', () => {
    const [first, ...rest] = PAGES.map(({ name }) => signatures[name].sidebar.navItems);
    for (const items of rest) {
      expect(items).toEqual(first);
    }
  });
});

// ─── 4. Content area wrapper ──────────────────────────────────────────────────

describe('Content area wrapper', () => {
  it('all pages share the same content area CSS classes', () => {
    const classes = PAGES.map(({ name }) => signatures[name].contentAreaClasses);
    const unique = new Set(classes);
    expect(
      unique.size,
      `Content area classes differ:\n${
        PAGES.map(({ name }) => `  ${name}: "${signatures[name].contentAreaClasses}"`).join('\n')
      }`,
    ).toBe(1);
  });

  it('content area uses the expected flex-column layout classes', () => {
    const { contentAreaClasses } = signatures['Dashboard'];
    expect(contentAreaClasses).toContain('flex');
    expect(contentAreaClasses).toContain('flex-col');
    expect(contentAreaClasses).toContain('overflow-hidden');
  });
});

// ─── 5. Page header ───────────────────────────────────────────────────────────

describe('Page header', () => {
  it('all pages use a <header> element as the first content child', () => {
    for (const { name } of PAGES) {
      expect(
        signatures[name].header.tag,
        `${name}: expected header tag "header", got "${signatures[name].header.tag}"`,
      ).toBe('header');
    }
  });

  it('all pages share the same header container CSS classes', () => {
    const classes = PAGES.map(({ name }) => signatures[name].header.containerClasses);
    const unique = new Set(classes);
    expect(
      unique.size,
      `Header container classes differ:\n${
        PAGES.map(({ name }) => `  ${name}: "${signatures[name].header.containerClasses}"`).join('\n')
      }`,
    ).toBe(1);
  });

  it('each page header contains an h1 title', () => {
    for (const { name } of PAGES) {
      expect(
        signatures[name].header.hasH1,
        `${name}: header does not contain an h1`,
      ).toBe(true);
    }
  });

  it('each page has a non-empty h1 title text', () => {
    for (const { name } of PAGES) {
      expect(
        signatures[name].header.h1Text,
        `${name}: h1 text is empty`,
      ).not.toBe('');
    }
  });

  it('page titles are all distinct (no two pages share the same title)', () => {
    const titles = PAGES.map(({ name }) => signatures[name].header.h1Text);
    const unique = new Set(titles);
    expect(
      unique.size,
      `Some page titles are duplicated: ${titles.join(', ')}`,
    ).toBe(PAGES.length);
  });
});

// ─── 6. h1 count per page ────────────────────────────────────────────────────

describe('h1 heading count', () => {
  it('each page renders exactly one top-level h1', () => {
    for (const { name } of PAGES) {
      expect(
        signatures[name].h1Count,
        `${name}: expected 1 h1, found ${signatures[name].h1Count}`,
      ).toBe(1);
    }
  });
});

// ─── 7. Active nav item ───────────────────────────────────────────────────────

describe('Active nav item', () => {
  it('each page has exactly one visually active sidebar item', () => {
    for (const { name } of PAGES) {
      expect(
        signatures[name].activeNavItemCount,
        `${name}: expected 1 active nav item, found ${signatures[name].activeNavItemCount}`,
      ).toBe(1);
    }
  });
});

// ─── 8. Snapshot comparison ───────────────────────────────────────────────────

describe('Structural snapshot', () => {
  it.each(PAGES)('$name page structure matches snapshot', ({ name }) => {
    // Capture only the structural data (not the full HTML) to keep snapshots readable.
    expect({
      rootClasses: signatures[name].rootClasses,
      contentAreaClasses: signatures[name].contentAreaClasses,
      sidebarPanelClasses: signatures[name].sidebar.panelClasses,
      navItems: signatures[name].sidebar.navItems,
      headerTag: signatures[name].header.tag,
      headerClasses: signatures[name].header.containerClasses,
      h1Count: signatures[name].h1Count,
    }).toMatchSnapshot();
  });
});
