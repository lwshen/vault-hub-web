# VaultHub Web

A modern, secure web application for credential and secret management built with React, TypeScript, and Vite.

## Overview

VaultHub Web is the frontend interface for VaultHub, a comprehensive solution for managing sensitive credentials, API keys, and secrets. It provides an intuitive dashboard for vault management, API key administration, audit logging, and real-time monitoring.

### Key Features

- **Vault Management** - Create, read, update, and delete vaults with pagination support
- **API Key Management** - Generate and manage API keys for programmatic access
- **Audit Logging** - Comprehensive audit trail with metrics and visualization
- **Multi-Auth Support** - Email/password, magic link, and OIDC authentication
- **Real-time Dashboard** - Monitor system status, recent activities, and metrics
- **Documentation Viewer** - Built-in documentation for CLI, API, server setup, and security
- **Theme Support** - Dark/light mode with system preference detection
- **Responsive Design** - Mobile-friendly interface built with Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 22 or higher
- **pnpm** 10.15.1 (specified in `package.json`)
- **VaultHub Server** - The backend API server must be running (default: `http://localhost:3000`)
  - Repository: https://github.com/lwshen/vault-hub

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd vault-hub-web
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure environment variables:

Copy the example environment file and configure it for your setup:

```bash
cp .env.example .env
```

Edit `.env` to set your backend API URL:

```env
# Default: http://localhost:3000
VITE_API_URL=http://localhost:3000
```

The development server will proxy all `/api` requests to the URL specified in `VITE_API_URL`. If not set, it defaults to `http://localhost:3000`.

## Available Scripts

### Development

```bash
# Start development server with hot module replacement
pnpm dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Build

```bash
# Create production build
pnpm build
```

Outputs optimized bundle to the `dist/` directory.

### Preview

```bash
# Preview production build locally
pnpm preview
```

### Code Quality

```bash
# Run ESLint
pnpm lint

# Type-check with TypeScript
pnpm typecheck
```

## Tech Stack

### Core

- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server

### State Management

- **Zustand** - Lightweight state management
- **React Context** - Authentication state

### Routing

- **Wouter** - Minimalist client-side router

### Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Class Variance Authority** - Component variant management
- **Framer Motion** - Animation library
- **next-themes** - Theme management

### API Integration

- **@lwshen/vault-hub-ts-fetch-client** - Generated TypeScript API client

### Additional Libraries

- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **React Markdown** - Markdown rendering
- **Highlight.js** - Code syntax highlighting

## Project Structure

```
src/
├── apis/                # API client configuration
│   └── api.ts          # Centralized API setup with auth & error handling
├── components/
│   ├── dashboard/      # Feature components (vaults, API keys, audit logs)
│   ├── layout/         # Layout components (header, sidebar, dashboard layout)
│   ├── modals/         # Modal dialogs (create/edit vault, API keys)
│   ├── ui/             # Reusable UI components (button, card, input, etc.)
│   └── hero/           # Landing page components
├── contexts/           # React Context providers
│   ├── auth-provider.tsx    # Authentication logic
│   └── theme-context.tsx    # Theme management
├── hooks/              # Custom React hooks
│   ├── use-auth.ts          # Authentication hook
│   ├── use-app-config.ts    # App configuration hook
│   └── use-theme.ts         # Theme hook
├── stores/             # Zustand stores
│   ├── vault-store.ts       # Vault state management
│   ├── api-key-store.ts     # API key state management
│   └── audit-store.ts       # Audit log state management
├── pages/              # Page/route components
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Dashboard pages
├── const/              # Constants
│   ├── path.ts            # Route path constants
│   └── navigation.ts      # Navigation menu configuration
├── docs/               # Documentation markdown files
├── lib/                # Utility libraries
├── utils/              # Utility functions
├── routes.tsx          # Route definitions
└── main.tsx            # Application entry point
```

## Architecture Highlights

### API Integration

All API clients are centralized in `src/apis/api.ts` with:
- **Authentication middleware** - Automatic JWT token injection
- **Error handling middleware** - Formatted error messages and rate limiting
- **Auto-redirect on 401** - Automatic logout and redirect to login

### State Management Pattern

**Zustand stores** handle domain-specific logic:
```typescript
// Store actions combine API calls with state updates
fetchVaults: async (pageIndex = 0, pageSize = 10) => {
  set({ isLoading: true, error: null });
  const data = await vaultApi.getVaults(pageSize, pageIndex);
  set({ vaults: data.items, totalCount: data.total });
}
```

**React Context** manages authentication state and user information.

### Component Architecture

Three-layer pattern:
1. **Page components** (`src/pages/`) - Route wrappers
2. **Content components** (`src/components/dashboard/`) - Feature logic and store integration
3. **UI components** (`src/components/ui/`) - Reusable design system

### Authentication Flow

1. App initializes → `AuthProvider` checks for token in URL fragment or localStorage
2. Validates token via `userApi.getCurrentUser()`
3. Sets user in context and redirects to dashboard
4. All API requests automatically include token
5. 401 errors trigger automatic logout

### Pagination Pattern

Stores manage pagination state (`pageIndex`, `pageSize`, `totalCount`) and automatically refetch data when page changes.

## Development Workflow

### Adding a Protected Route

1. Define path constant in `src/const/path.ts`
2. Create page component in `src/pages/dashboard/`
3. Create content component in `src/components/dashboard/`
4. Add route in `src/routes.tsx` wrapped in `<ProtectedRoute>`
5. Update navigation in `src/const/navigation.ts`

### Adding a Zustand Store

1. Create store file in `src/stores/`
2. Define state interface and actions
3. Use API client from `src/apis/api.ts`
4. Export hook: `export const useFeatureStore = create<FeatureStore>(...)`
5. Consume in components via `const { data, fetchData } = useFeatureStore()`

### Adding a Modal

1. Create modal component in `src/components/modals/`
2. Use `AlertDialog` from `@/components/ui/alert-dialog` as base
3. Accept `open` and `onOpenChange` props
4. Parent component manages modal state

## Build Configuration

### Vite Configuration

- **Development proxy**: `/api` → `http://localhost:3000`
- **Code splitting strategy**:
  - `ui-libs`: Radix UI, Framer Motion, Lucide
  - `vendor`: React/React-DOM
  - `api`: vault-hub-ts-fetch-client
- **Path alias**: `@` → `./src`

### Build Output

Production builds are output to the `dist/` directory with optimized chunking for better caching and performance.

## CI/CD

The project includes GitHub Actions workflows for:
- **Continuous Integration** - Type checking, linting, and building
- **Automated reviews** - Claude and Cursor code review workflows
- **Mirroring** - Repository mirroring setup

See `.github/workflows/` for workflow configurations.

## Code Style

The project uses ESLint with strict TypeScript and React rules:
- 2-space indentation
- Single quotes (with escape avoidance)
- Semicolons required
- Object curly spacing
- Trailing commas in multiline

UI components in `src/components/ui/` are excluded from ESLint checks as they are generated from the design system.

## Environment

The application expects:
- Backend API running on `http://localhost:3000` (configurable via Vite proxy)
- JWT tokens stored in `localStorage` under the key `'token'`
- Runtime configuration available at `/api/config`

## Documentation

Built-in documentation is available in the app and includes:
- **CLI Guide** - Command-line interface usage
- **Server Setup** - Backend configuration
- **API Reference** - REST API documentation
- **Security** - Security best practices

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
