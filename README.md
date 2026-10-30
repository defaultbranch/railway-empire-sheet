# Railway Empire Workspace

Applications and shared code managed with pnpm workspaces:

- [app2610](apps/app2610/README.md): the new application stub, started in October 2026, awaiting its design philosophy.
- [app2609](apps/app2609/README.md): the established browser-only application, started in September 2026; still the default.
- [app2312](apps/app2312/README.md): the archived Angular/Nx prototype, started in December 2023, previously in `old/`.
- [shared](packages/shared/README.md): a framework-independent package for incremental extraction of reusable models and mechanics.

## Getting Started

Use Node.js 24.21 or newer and the pnpm version pinned in `package.json`.

```sh
corepack enable
pnpm install
pnpm dev
```

Run these commands from the repository root:

- `pnpm dev` or `pnpm dev:app2609`: start app2609.
- `pnpm dev:app2610`: start the app2610 stub.
- `pnpm test`: run app2609's tests.
- `pnpm build` or `pnpm build:app2609`: type-check and build app2609.
- `pnpm build:app2610`: type-check and build app2610.
- `pnpm build:shared`: type-check the shared package.
- `pnpm preview`: preview the app2609 production build.
- `pnpm preview:app2610`: preview the app2610 production build.
- `pnpm dev:app2312`: start app2312 using its local Nx setup.
- `pnpm build:app2312`: build app2312.
- `pnpm build:all`: build all workspace packages.

The Angular prototype retains its original dependencies. Angular 17/Nx 18 do not
officially support the root's Node.js 24 runtime; modernizing that application is
separate from this directory migration.

## Workspace Layout

Application source, configuration, and dependencies belong to each application's
directory under `apps/`. The root owns the package-manager configuration, common
commands, and shared `pnpm-lock.yaml`. Run `pnpm install` at the root after changing
any package's dependencies.

Install lifecycle scripts are disabled workspace-wide with `ignoreScripts: true`
in `pnpm-workspace.yaml`. Explicit commands such as `pnpm test` and `pnpm build`
remain available.

To add another application, create `apps/<name>/package.json` with a unique package
name and its own scripts. Run it with `pnpm --filter <package-name> <script>`.

Shared libraries belong under `packages/`. Consumers can declare a local
dependency such as `"@railway/shared": "workspace:*"`. Applications otherwise remain
independent and can use different versions of the same dependency.
