# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development

- `pnpm dev` - Start development server with HMR (proxies `/api` to `http://localhost:3000`)
- `pnpm build` - Production build (outputs to `dist/`)
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint on codebase
- `pnpm typecheck` - Type-check with TypeScript compiler

### Package Management

- Uses `pnpm@10.15.1` as package manager
- Run `pnpm install` to install dependencies

## Architecture Overview

### Tech Stack

- **Framework**: React 19 + Vite 7
- **Language**: TypeScript 5.9
- **State Management**: Zustand (global) + React Context (auth)
- **Routing**: Wouter (lightweight client-side router)
- **Styling**: Tailwind CSS 4 + CVA (class-variance-authority)
- **UI Components**: Radix UI primitives
- **API Client**: `@lwshen/vault-hub-ts-fetch-client` (generated TypeScript client)
- **Notifications**: Sonner (toast)
- **Theme**: next-themes (dark/light mode)

### Directory Structure

```
src/
├── apis/                # API client configuration (auth middleware, error handling)
├── components/
│   ├── dashboard/       # Feature components (vaults-content, vault-detail-content, etc.)
│   ├── layout/          # Layout components (header, sidebar, dashboard-layout)
│   ├── modals/          # Modal dialogs (create-vault-modal, edit-vault-modal, etc.)
│   └── ui/              # Base UI components (button, card, input, etc.) - IGNORED BY ESLINT
├── contexts/            # React Context providers (auth-provider, theme-context)
├── hooks/               # Custom React hooks (use-auth, use-app-config, etc.)
├── stores/              # Zustand stores (vault-store, api-key-store, audit-store)
├── pages/               # Page/route components (auth/, dashboard/, documentation, etc.)
├── const/               # Constants (path.ts for routes, navigation.ts for menus)
├── utils/               # Utility functions
├── docs/                # Documentation files
├── lib/                 # Utility libraries (cn() for className merging)
├── routes.tsx           # Route definitions
└── main.tsx             # Entry point
```

### Key Architectural Patterns

#### 1. API Integration (`src/apis/api.ts`)

- **Centralized configuration** for all API clients
- **Authentication middleware**: Injects JWT token from localStorage (`Authorization: Bearer {token}`)
- **Error handling middleware**:
  - Extracts error messages from response body
  - Handles rate limiting via `Retry-After` header
  - Auto-redirects to login on 401 (debounced)
- **Exported API instances**: `authApi`, `userApi`, `vaultApi`, `auditApi`, `apiKeyApi`, `statusApi`, `configApi`

#### 2. State Management Pattern

**Zustand stores** handle domain logic:

- `vault-store.ts`: Vault CRUD + pagination (`fetchVaults`, `deleteVault`, `setPageIndex`)
- `api-key-store.ts`: API key management (`fetchApiKeys`, `deleteApiKey`)
- `audit-store.ts`: Audit logs + metrics (`fetchAuditLogs`, `fetchMetrics`)

**Pattern**: API calls wrapped in store actions

```typescript
// Store action combines API call + state update
fetchVaults: async (pageIndex = 0, pageSize = 10) => {
  set({ isLoading: true, error: null });
  const data = await vaultApi.getVaults(pageSize, pageIndex);
  set({ vaults: data.items, totalCount: data.total });
};
```

**React Context** for authentication:

- `AuthProvider` manages user state and token handling
- `useAuth()` hook exposes `user`, `isAuthenticated`, `login()`, `logout()`

#### 3. Routing Pattern (Wouter)

- Routes defined in `src/routes.tsx`
- Protected routes wrapped in `<ProtectedRoute>` component
- Path constants in `src/const/path.ts` for type-safe navigation
- Dynamic routes use params: `/dashboard/vaults/:vaultId`

#### 4. Component Architecture

**Three-layer pattern**:

1. **Page components** (`src/pages/`) - Minimal wrappers for routes
2. **Content components** (`src/components/dashboard/`) - Feature logic, store integration, modal management
3. **UI components** (`src/components/ui/`) - Reusable design system components

**Modal pattern**:

- Parent component manages modal state (`open`, `setOpen`)
- Modal receives `onOpenChange` callback
- API calls inside modal with success callbacks (`onVaultCreated()`)
- Delete confirmations use inline Card overlays

#### 5. Authentication Flow

1. App initializes → `AuthProvider` checks for token in URL fragment (`#token=...&source=magic|oidc`) or localStorage
2. Calls `userApi.getCurrentUser()` to validate token
3. Sets user in context, redirects to dashboard
4. 401 errors trigger logout and redirect to login
5. All API requests automatically include token via middleware

#### 6. Pagination Pattern

- Zustand stores manage `pageIndex`, `pageSize`, `totalCount`
- Store methods like `setPageIndex()` trigger auto-refetch
- UI components use `Pagination` component from `src/components/ui/pagination.tsx`

## Code Style Guidelines

### ESLint Configuration

- Uses strict TypeScript + React rules (`@eslint-react/eslint-plugin`)
- **Important**: `src/components/ui/**/*` is **ignored by ESLint** (design system components)
- Stylistic rules enforced via `@stylistic/eslint-plugin`:
  - 2-space indentation
  - Single quotes (with `avoidEscape: true`)
  - 1tbs brace style
  - Semicolons required
  - Object curly spacing: `{ foo }` not `{foo}`
  - Trailing commas in multiline
  - Interface/type members end with semicolons

### TypeScript Configuration

- Path alias: `@/*` maps to `./src/*`
- Use `@/` imports for all internal modules
- Strict mode enabled

### Component Patterns

- Functional components with hooks
- Props interfaces defined inline or exported
- Use `React.FC` sparingly (prefer explicit return types)
- Custom hooks start with `use` prefix

## Common Development Workflows

### Adding a New Protected Route

1. Define path constant in `src/const/path.ts`
2. Create page component in `src/pages/dashboard/`
3. Create content component in `src/components/dashboard/`
4. Add route in `src/routes.tsx` wrapped in `<ProtectedRoute>`
5. Update navigation in `src/const/navigation.ts` if needed

### Adding a New Zustand Store

1. Create store file in `src/stores/` (e.g., `feature-store.ts`)
2. Define state interface and actions
3. Use API client from `src/apis/api.ts`
4. Export hook: `export const useFeatureStore = create<FeatureStore>(...)`
5. Consume in components via `const { data, fetchData } = useFeatureStore()`

### Adding a New Modal

1. Create modal component in `src/components/modals/`
2. Use `AlertDialog` from `@/components/ui/alert-dialog` as base
3. Accept `open` and `onOpenChange` props
4. Optional success callback prop (e.g., `onSuccess?: () => void`)
5. Parent component manages modal state and callbacks

### Working with API Client

- Import from `src/apis/api.ts`: `import { vaultApi } from '@/apis/api'`
- All API methods return Promises
- Error handling is automatic via middleware (errors formatted for display)
- Token injection is automatic
- Handle polymorphic responses (array vs. object wrapper) in stores

## Build Configuration Notes

### Vite Config (`vite.config.ts`)

- Development proxy: `/api` → `http://localhost:3000`
- Code splitting strategy:
  - `ui-libs`: Radix, Framer Motion, Lucide
  - `vendor`: React/React-DOM
  - `api`: vault-hub-ts-fetch-client
- Alias: `@` → `./src`

### Tailwind CSS

- Version 4 with Vite plugin (`@tailwindcss/vite`)
- Custom utilities via `tw-animate-css`
- Typography plugin enabled (`@tailwindcss/typography`)
- Dark mode via class strategy (next-themes)

## Important Implementation Details

### Token Storage

- JWT stored in `localStorage` under key `'token'`
- Token cleared on logout and 401 errors
- Magic link and OIDC tokens extracted from URL fragment

### App Configuration

- `useAppConfig()` hook fetches runtime config from `/api/config`
- Determines OIDC and email auth availability
- Used to conditionally render auth options

### Error Handling Strategy

1. API middleware extracts and formats errors
2. Stores capture error messages in state
3. Components render error alerts conditionally
4. Toast notifications provide user feedback (Sonner)

### Theme Management

- `ThemeProvider` wraps app in `src/App.tsx`
- `useTheme()` hook for theme access
- Toggle component in header: `ThemeToggle`
- Persistence via localStorage (next-themes)
