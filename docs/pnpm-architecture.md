# pnpm Monorepo Architecture

## Goal

To manage a monorepo with `pnpm` avoiding dependency conflicts (especially React versions) and clearly separating responsibilities between `web`, `mobile`, and shared `packages`.

## Directory Structure

```
.
├─ package.json              # Root settings (scripts, devDependencies)
├─ pnpm-lock.yaml           # Single source of truth for dependencies
├─ pnpm-workspace.yaml      # Workspace definitions
├─ .npmrc                   # Strict pnpm settings
├─ .nvmrc / .node-version   # Node version pinning
├─ apps/
│   ├─ web/                  # Next.js (Frontend + BFF)
│   └─ mobile/               # React Native / Expo (UI only)
├─ packages/
│   ├─ ui/                   # Shared UI (components, pure functions)
│   ├─ core/                 # Domain logic
│   ├─ api-client/           # API wrapper
│   ├─ auth/                 # Authentication wrapper
│   ├─ db/                   # Database schema/queries
│   └─ config/               # Shared configs (eslint, tsconfig)
└─ infra/
    └─ docker/              # Docker compose for DB etc.
```

## Configuration

### Root `package.json`

Manages toolchain dependencies. `packageManager` must be pinned.

```json
{
  "name": "3d-avatar-monorepo",
  "private": true,
  "packageManager": "pnpm@9.x.x",
  "scripts": {
    "dev": "pnpm -r dev",
    "build": "pnpm -r build"
  }
}
```

### `.npmrc`

Critical for avoiding conflicts.

```ini
strict-peer-dependencies=true
auto-install-peers=false
shared-workspace-lockfile=true
shamefully-hoist=false
```

## Strategy

### 1. React Version Pinning

- **Rule**: `apps/web` and `apps/mobile` MUST use the same React major version compatible with the React Native version.
- **Current Pin**: React `18.3.1` (To match React Native 0.76).
- **Overrides**: Use `pnpm.overrides` in root `package.json` if necessary to force resolution.

### 2. Separation of Concerns

- **UI Package**: Does NOT depend on `react` directly. Uses `peerDependencies`.
- **Core/DB/Auth**: Logic abstracted away from the app layer.

### 3. Usage Rules

- Always use `pnpm install`.
- Always commit `pnpm-lock.yaml`.
- Fix strict peer dependency errors immediately.
