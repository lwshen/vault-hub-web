# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React + TypeScript source: `apis/` (generated clients), `components/` (shared UI), `contexts/` (providers), `pages/` (routed views), `stores/` (Zustand state), `utils/` (helpers), and `docs/` (in-app copy).
- Stick to the `@/` path alias defined in `tsconfig.app.json` by keeping new modules under `src/`.
- Static assets belong in `public/`. `pnpm build` emits `dist/`; leave it ignored.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies (pnpm 10.x+ recommended).
- `pnpm dev` — start the Vite dev server with hot reload.
- `pnpm build` / `pnpm preview` — create and locally serve the production bundle.
- `pnpm lint` — run ESLint via `eslint.config.js`.
- `pnpm typecheck` — project-wide TypeScript checks; run with `pnpm lint` before pushing.

## Coding Style & Naming Conventions
- The codebase is strictly typed (`strict` mode). Stick to two-space indentation, functional components, and React hooks.
- Name React components with `PascalCase` (`VaultOverview.tsx`), hooks with a `use` prefix (`useVaultStore.ts`), and colocate Zustand selectors with their store files.
- Tailwind CSS drives styling; keep classes declarative in JSX, extract repeated clusters into `components/`, and rely on ESLint autofix rather than adding new formatters.

## Testing Guidelines
- No automated runner is configured yet. If you add one, place specs as `*.test.ts(x)` beside the code or inside `src/__tests__/` and wire it to `pnpm test`.
- For now, verify changes via `pnpm dev`, note manual QA steps in the PR, and run `pnpm lint` plus `pnpm typecheck` to catch regressions.
- Discuss new testing tooling in the PR so maintainers can confirm CI support.

## Commit & Pull Request Guidelines
- Follow a Conventional Commits style (`feat: add vault filters`, `fix: guard suspended sessions`) and squash noisy WIP commits.
- Before opening a PR, run `pnpm lint`, `pnpm typecheck`, and `pnpm build`; list the commands and results in the PR body.
- PRs need a concise summary, linked issue, and screenshots or clips for UI updates. Flag migrations or config changes in a checklist, keep the scope tight, and note follow-up tasks instead of bundling them.

## Environment & Configuration
- Store secrets in Vite env files such as `.env.local`; keep them untracked and share redacted examples only.
- Prefer the generated client in `src/apis/` (`@lwshen/vault-hub-ts-fetch-client`) for backend access so changes stay aligned with the API schema.
