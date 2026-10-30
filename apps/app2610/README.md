# Railway Empire app2610

A minimal React/TypeScript/Vite application, started in October 2026.
The design philosophy, navigation, and workflows are intentionally undecided.
This stub does not copy app2609's pages or change its functionality.

## Development

From the repository root:

```sh
pnpm install
pnpm dev:app2610
pnpm build:app2610
pnpm preview:app2610
```

The development server prefers port 5210; production preview prefers port 4210.
Vite selects another port if one is already in use.

## Shared Code

The app already depends on [@railway/shared](../../packages/shared/README.md)
through `workspace:*`. Its entry point imports the empty package to keep the
workspace connection checked by TypeScript and Vite. Replace that import with
named imports as reusable models and mechanics are migrated from app2609.

There is deliberately no router, application state, persistence, or UI framework
beyond React yet. Add these only as the new design requires them.
