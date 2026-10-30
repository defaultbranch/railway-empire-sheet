# Railway Empire Workspace

Independent applications managed with pnpm workspaces:

- [React app](apps/react-app/README.md): the current browser-only application.
- [Angular app](apps/angular-app/README.md): the archived Angular/Nx prototype, previously in `old/`.

## Getting Started

Use Node.js 24.21 or newer and the pnpm version pinned in `package.json`.

```sh
corepack enable
pnpm install
pnpm dev
```

Run these commands from the repository root:

- `pnpm dev` or `pnpm dev:react`: start the React app.
- `pnpm test`: run the React app's tests.
- `pnpm build` or `pnpm build:react`: type-check and build the React app.
- `pnpm preview`: preview the React production build.
- `pnpm dev:angular`: start the archived Angular app using its local Nx setup.
- `pnpm build:angular`: build the archived Angular app.
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

Future shared libraries belong under `packages/`. Consumers can declare a local
dependency such as `"@railway/shared": "workspace:*"`. Applications otherwise remain
independent and can use different versions of the same dependency.
