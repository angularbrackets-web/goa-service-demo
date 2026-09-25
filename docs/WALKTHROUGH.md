# Walkthrough: code tour and talking points

A guide for presenting this repository in about 10 minutes, followed by how each part maps to the
**Scope of Services** in the Full Stack Developer (Senior) posting for the Digital Design and
Delivery Division.

## 1. Two-minute demo script

1. `npm run db:up && npm run dev`, open <http://localhost:5173>.
2. Start page: service name, "Before you start", emergency callout, **Start now** (GoA start page
   pattern).
3. Question 1: press **Continue** with nothing selected. Point out the error summary (focused, with a
   link to the field), the same message on the field, and the `Error:` prefix in the tab title.
4. Answer the questions. On question 5 choose **Yes** to show the reveal pattern for the email field
   and the "Why are we asking?" details.
5. Check your answers: **Change** a value and note it returns you to this page.
6. Submit, show the reference number, then open `/staff`, enter the demo token and move the report to
   **In progress**.
7. Open <http://localhost:3000/api/docs> to show the generated OpenAPI docs.

## 2. Code tour (read in this order)

### Web (`apps/web/src`)

| File                                           | What to say                                                                                                                      |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `main.tsx`                                     | Registers the GoA web components once and wraps the app in the router and form state provider.                                   |
| `index.css`                                    | Imports GoA component CSS and design tokens; custom CSS only for layout, all values from tokens.                                 |
| `components/Layout.tsx`                        | GoA app header, a non-dismissible demo callout and our own footer, with the reasons why.                                         |
| `form/steps.ts`                                | The question order in one place. Drives "Question X of Y", Back links, Continue and "first unanswered question".                 |
| `form/answers.ts`                              | Answers type, validation rules with plain-language messages matching the API, and `toSubmission` (sends only what is needed).    |
| `form/ReportFormContext.tsx`                   | Answers in React state, mirrored to `sessionStorage` so a refresh keeps progress, cleared after submit.                          |
| `components/QuestionPage.tsx`                  | The GoA question page pattern as one reusable component: back link, progress, error summary, `<h1>`, Continue / Save and return. |
| `components/ErrorSummary.tsx`, `focusField.ts` | Accessible error summary; moving focus into a shadow-DOM input.                                                                  |
| `components/usePageSetup.ts`                   | Page title and focus management for a single-page app.                                                                           |
| `pages/questions/*.tsx`                        | Each question is about 30 lines: one `GoabFormItem` and one control.                                                             |
| `pages/CheckAnswersPage.tsx`                   | Review pattern, submission, mapping API field errors back to "change" links.                                                     |
| `pages/StaffPage.tsx`                          | `GoabTable`, `GoabBadge`, `GoabDropdown`, a live region announcing status changes.                                               |
| `api/client.ts`                                | Thin `fetch` wrapper; typed errors for validation (400) and auth (401).                                                          |

### API (`apps/api/src`)

| File                                        | What to say                                                                                                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main.ts`, `app.setup.ts`                   | Bootstrap; `configureApp()` holds the global prefix, helmet, `ValidationPipe` (whitelist + forbid unknown fields) and Swagger, shared with the integration tests. |
| `config.ts`                                 | Environment read and checked once at startup (fail fast).                                                                                                         |
| `reports/public-reports.controller.ts`      | `POST /api/reports` returns only a receipt (reference + time).                                                                                                    |
| `reports/staff-reports.controller.ts`       | List, detail and status change, behind `StaffTokenGuard`.                                                                                                         |
| `reports/dto/*`                             | class-validator rules with the same messages the UI uses; response DTOs choose what each audience sees (list has no email).                                       |
| `reports/reports.service.ts`                | Business rules: date not in the future (Alberta time), allowed status transitions, retry on reference collision, no personal information in logs.                 |
| `reports/reports.repository.ts`             | The port (abstract class, doubles as the DI token).                                                                                                               |
| `reports/prisma-reports.repository.ts`      | The Prisma adapter; maps rows to domain objects and DB errors to domain errors.                                                                                   |
| `reports/reference.ts`                      | Human-friendly references using an alphabet without I, L, O, U.                                                                                                   |
| `auth/staff-token.guard.ts`                 | Constant-time token check; explicitly a placeholder for Keycloak/OIDC.                                                                                            |
| `prisma/schema.prisma`, `prisma/migrations` | Schema with column limits matching validation; SQL migration committed.                                                                                           |

### Tests and pipeline

- `apps/api/src/reports/reports.service.spec.ts`: rules tested with `test/in-memory-reports.repository.ts`.
- `apps/api/test/reports.integration.spec.ts`: real app + PostgreSQL over HTTP.
- `apps/web/src/**/*.test.tsx`: page behaviour in jsdom (dispatching the components' custom events).
- `e2e/report-issue.spec.ts`: full journey with axe on each page; `e2e/helpers.ts` documents the
  known component-library findings.
- `.github/workflows/ci.yml`: quality gate, integration and e2e jobs with PostgreSQL service containers.

## 3. Mapping to the Scope of Services

**1. Research and discovery; lead technical discovery and produce artifacts (diagrams, docs).**
The README architecture diagram and the ADRs are the kind of lightweight artifacts I would produce in
discovery: the options, the decision and the trade-offs, written so product owners and new developers
can follow them. On a real project I would also join user interviews to hear the problems first-hand,
for example why people abandon a form at a certain question.

**2. Solution design and development; defect discovery and resolution; code quality and tooling.**
Layered API (controller, service, repository port, adapter), strict validation, and tests at each
level. A concrete defect found and fixed during the build: after a successful submit, the check-answers
page reset the answers and redirected back to question 1 before the confirmation page rendered. The fix
was to clear the answers on the confirmation page instead, and an e2e test guards it. axe also
caught a colour-contrast failure in my own footer.

**3. Collaborate with frontend designers for a consistent look and feel.**
The UI is built only from GoA components and tokens and follows the documented start, question, review
and result patterns. When a component could not do what we needed (the footer's fixed copyright text),
I did not override its internals; I recorded why and built the smallest alternative from tokens. That
is the conversation I would have with a designer, not a CSS hack.

**4. Advise product owners on implementation options for frequent delivery.**
The ADRs show options and consequences in plain language (for example Prisma vs TypeORM vs raw SQL,
explicit routes vs `GoabPublicForm`). The "Not in scope" list in the README is a starting backlog
(save and return, SSO, notifications) that could be sized and prioritised.

**5. Support deployment and launch (limited and general availability).**
CI runs the full test suite on every change against production builds. `/api/health` checks the
database and suits an OpenShift readiness probe, configuration comes from environment variables, and
migrations are applied with `prisma migrate deploy`. Limited availability could mean a feature flag or
an alpha phase banner with a feedback link.

**6. Reuse in design and implementation; contribute to common components.**
The app reuses the design system instead of building UI. `QuestionPage` makes each new question about
30 lines. The axe findings in `e2e/helpers.ts` (icon `role="img"` without a name, date picker labels,
nested interactive dropdown trigger) are what I would take to the design system team as issues or pull
requests, so every service benefits and not just this one.

**7. Onboarding, documentation and team practices.**
A new developer can clone, run `npm install && npm run db:up && npm run dev`, and read this walkthrough.
Formatting, linting, type checking and tests run the same way locally and in CI.

## 4. Accessibility talking points (WCAG 2.2 AA)

- Components are built to WCAG 2.2; the service is still responsible for headings, titles, focus,
  error handling and content.
- Error summary pattern: focus moves to the summary, each message links to its field, and the message
  also appears on the field (WCAG 3.3.1, 3.3.3).
- Unique page titles (2.4.2), a focused `<h1>` after each navigation, skip link (2.4.1), hidden
  context for "Change" links (2.4.4), live region for staff status changes (4.1.3).
- Automated axe checks in CI catch regressions but not everything; I would add keyboard-only and
  screen reader checks to the definition of done and include people with disabilities in usability
  testing.

## 5. Questions to be ready for

- _Why not store the email in the list response?_ Staff triage does not need it; data minimisation.
  It is available on the detail endpoint for the person following up.
- _How would you add real authentication?_ Replace `StaffTokenGuard` with an OIDC guard validating
  Keycloak-issued JWTs (for example ADSP's access service), with a role such as `road-report-staff`.
  The controllers do not change.
- _How would this scale to many forms?_ Keep `steps.ts` as data, consider the design system's
  `GoabPublicForm` or ADSP's form service, and generate the API client from OpenAPI.
- _What would you do with legacy systems?_ Put a stable API in front (strangler pattern), move one
  journey at a time, and keep the old path working until the new one is proven in production.
- _Why Vitest and not Jest?_ See ADR 0004: it is Nest 12's ESM default and matches the web app;
  the test API is Jest-compatible.
