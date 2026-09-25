# ADR 0003: PostgreSQL with Prisma behind a repository port

- Status: Accepted
- Date: 2026-09-25

## Context

Reports are structured, relational data with a unique reference, a status workflow and simple
filters. The API needs a real database in integration tests and a schema that is easy to review.

## Decision

- **PostgreSQL 17**: open source, common across GoA platforms, and available as a CI service
  container and via `docker compose` locally.
- **Prisma 7** as the ORM, with the `prisma-client` generator (ESM, output to `src/generated`), the
  `pg` driver adapter, and connection settings in `prisma.config.ts`. The schema file reads well in a
  review, and migrations are plain SQL committed under `prisma/migrations`.
- Column constraints mirror validation (`VARCHAR(200)` location, `VARCHAR(1000)` description, `DATE`
  for the date noticed, native enums for type and status).
- The service depends on an abstract `ReportsRepository` (a port). `PrismaReportsRepository` is the
  adapter; it maps rows to plain domain objects and translates Prisma's unique-violation error
  (`P2002`) into a domain `DuplicateReferenceError`.

## Alternatives considered

- **TypeORM**: also supported by Nest. Decorator-based entities mix persistence concerns into
  classes; Prisma's schema + generated types are simpler to explain.
- **Raw SQL with `pg`**: fine for this size, but loses typed queries and migration tooling.

## Consequences

- `ReportsService` has no Prisma import, so its rules are unit tested with an in-memory fake that
  honours the same contract, and integration tests cover the real adapter.
- Prisma's generated client must exist before build/test; `postinstall` runs `prisma generate`.
- `npm audit` flags advisories in dependencies of the Prisma CLI (dev tooling, not the runtime);
  these would be tracked and resolved on a real project.
