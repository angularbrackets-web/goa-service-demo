# ADR 0001: Monorepo with npm workspaces

- Status: Accepted
- Date: 2026-09-25

## Context

The demo has a React front end and a NestJS API that change together (a new question means a UI
page, a DTO field and a column). It must be small enough to explain file by file. GoA's own ADSP
platform uses Nx, which is powerful but adds a layer of configuration a reviewer would have to learn
first.

## Decision

Use a single repository with plain **npm workspaces**: `apps/api` and `apps/web`, with Playwright
e2e tests and docs at the root. Root scripts fan out with `npm run <script> --workspaces`.

Front end and API do **not** share a TypeScript package. The few shared facts (issue types, length
limits, error messages) are duplicated in `apps/web/src/form/answers.ts` and
`apps/api/src/reports/report.types.ts`, with integration and e2e tests catching drift.

## Consequences

- One `npm install`, one lockfile, one CI pipeline; no extra build tool.
- Each app keeps the conventions of its framework's own generator (Nest CLI, Vite), so developers
  from either community feel at home.
- Duplication is a known cost. If the contract grew, the next step would be generating a typed
  client from the API's OpenAPI document (already served at `/api/docs-json`) rather than
  hand-sharing types. Nx or Turborepo become worth it with more apps or shared libraries.
