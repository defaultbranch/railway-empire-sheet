# Railway Empire Sheet

A small browser-only application for managing a Railway Empire game.

## Stack

- React with Vite and TypeScript
- SCSS for centralized styling in `src/styles.scss`

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

## Development Approach

Rather than a top-level menu, the app presents a sequence of pages that the user navigates through in order. The earliest pages cover simple, independent data, while later pages depend on data established by the ones before them. The purpose of this ordering is to build the application logic from the ground up, focusing on one aspect at a time instead of designing the whole data model up front.

## Specification

[railway-empire-spec.md](./railway-empire-spec.md) documents the game mechanics being modeled and the data model derived from them.

## Archived Prototype

The `old/` folder contains a previous prototype implementation. It is kept for archival purposes and is not intended to serve as a template.
