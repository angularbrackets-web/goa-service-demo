# ADR 0004: Testing strategy

- Status: Accepted
- Date: 2026-09-25

## Context

The service must keep working as questions and rules change, must stay accessible, and must be
safe to deploy often. Tests should be fast where possible and realistic where it matters.

## Decision

A test pyramid with one test runner (Vitest) for unit and integration tests and Playwright for
end-to-end tests:

| Layer                | Tool                                 | What it proves                                                                                                                        | Where                                 |
| -------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Unit (API)           | Vitest                               | Business rules in `ReportsService` (future dates, status transitions, reference collisions), DTO validation messages, the staff guard | `apps/api/src/**/*.spec.ts`           |
| Unit/component (web) | Vitest + Testing Library + jsdom     | Validation rules, error summary, question page behaviour, check-answers submission and server-error mapping                           | `apps/web/src/**/*.test.ts(x)`        |
| Integration (API)    | Vitest + supertest + real PostgreSQL | HTTP contract, validation pipe, guard, Prisma mapping, migrations                                                                     | `apps/api/test/*.integration.spec.ts` |
| End-to-end           | Playwright + axe-core                | The full citizen and staff journey against production builds; WCAG A/AA checks on every page                                          | `e2e/`                                |

**Why Vitest and not Jest:** NestJS 12's generator uses ESM and Vitest by default, and the web app
already uses Vitest through Vite. One runner with a Jest-compatible API (`describe`, `it`, `expect`,
`vi.fn`) avoids a second ESM/TypeScript transform setup. Moving to Jest would mostly mean changing
config, not tests.

## Consequences

- Unit tests run in about a second, with no database or network.
- Integration tests need PostgreSQL (`npm run db:up` locally, a service container in CI). They reuse
  `configureApp()` so they test the same HTTP setup as production.
- e2e tests start the compiled API and `vite preview`; the global setup empties the test table.
- axe finds only a part of accessibility problems. Manual keyboard and screen reader checks remain
  part of the definition of done.
- CI runs every layer on each push and pull request (`.github/workflows/ci.yml`).
