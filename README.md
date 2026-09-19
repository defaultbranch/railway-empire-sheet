# Railway Empire Sheet

A small browser-only application for managing a Railway Empire game.

## Stack

- React with Vite and TypeScript
- SCSS for centralized styling in `src/styles.scss`
- pnpm workspace with `minimumReleaseAge: 10080` to avoid installing packages published less than seven days ago

## Getting Started

```sh
corepack enable
corepack use pnpm@latest
pnpm install
pnpm dev
```

## Scripts

- `pnpm dev` starts the local Vite dev server.
- `pnpm build` type-checks and builds the app.
- `pnpm preview` serves the production build locally.
