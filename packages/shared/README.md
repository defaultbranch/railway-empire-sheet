# Shared Code

`@railway/shared` is the home for reusable Railway Empire models and mechanics.
It starts empty; app2609 remains unchanged and is the reference implementation
until individual pieces are deliberately migrated.

## Package Boundary

- Keep domain models and calculations independent of React, routing, browser
  storage, and application state management.
- Export public APIs from `src/index.ts`.
- Applications depend on this package; this package must not import from apps.
- Move code together with its relevant tests, then update consumers to use the
  shared implementation rather than maintaining copies.

Consumers declare `"@railway/shared": "workspace:*"` and import from
`@railway/shared`. The package exports TypeScript source for workspace bundlers
and type checkers, so it does not require a separate build before development.
`pnpm build:shared` checks its types without emitting JavaScript.

No models, mechanics, or test framework have been selected or migrated yet.
