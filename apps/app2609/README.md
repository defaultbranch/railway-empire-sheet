# Railway Empire Sheet

A small browser-only application for managing a Railway Empire game.

## Stack

- React with Vite and TypeScript
- SCSS for centralized styling in `src/styles.scss`

## Getting Started

```sh
pnpm install # from the repository root
pnpm --filter @railway/app2609 dev
```

## Scripts

From this directory, `pnpm dev` starts the local Vite dev server, `pnpm test`
runs the tests, `pnpm build` type-checks and builds the app, and `pnpm preview`
serves the production build locally. The repository root forwards these commands
to this application as well.

## Development Approach

Rather than a top-level menu, the app presents a sequence of pages that the user navigates through in order. The earliest pages cover simple, independent data, while later pages depend on data established by the ones before them. The purpose of this ordering is to build the application logic from the ground up, focusing on one aspect at a time instead of designing the whole data model up front.

The implemented pages, in order, are listed in [src/app/pages/pages.ts](./src/app/pages/pages.ts).

## Specification

[railway-empire-spec.md](./railway-empire-spec.md) documents the game mechanics being modeled and the data model derived from them.

## Archived Prototype

The [app2312](../app2312/README.md) contains a previous prototype
implementation. It is kept for archival purposes and is not intended to serve
as a template.
