# ADR 0002: Use the GoA Design System components

- Status: Accepted
- Date: 2026-09-25

## Context

GoA digital services are expected to look and behave consistently and to meet accessibility
standards. The GoA Design System (design.alberta.ca) publishes web components
(`@abgov/web-components`), React wrappers (`@abgov/react-components`) and design tokens
(`@abgov/design-tokens`) under Apache 2.0, plus page patterns (start, question, review, result).

## Decision

- Build the UI from `@abgov/react-components` 7.x, registering the underlying web components once in
  `main.tsx` and importing the component CSS and design tokens in `index.css`, as the developer setup
  guide describes.
- Follow the design system's **public form** pattern with explicit React Router routes (one route per
  question) instead of the newer `GoabPublicForm` controller. Explicit routes are easier to read,
  test and explain, and still produce the documented pattern.
- Use design tokens (`--goa-space-*`, `--goa-color-*`, `--goa-typography-*`) for the little custom CSS
  there is; no hard-coded colours or spacing.
- Do not present the demo as a GoA service: no microsite (phase) banner, whose fixed text says
  "Alberta Government service"; a non-dismissible "Unofficial personal demo" callout on every page;
  and a custom footer instead of `GoabAppFooter`, which always renders "© Government of Alberta".

## Consequences

- Most visual and interaction decisions are already made and tested by the design system team,
  which leaves more time for the service itself (content, flow, validation).
- The components render in shadow DOM. Tests locate native controls by their `name` (Playwright
  pierces shadow roots), and the error summary needs a small helper (`focusField`) to move focus into
  a component. In jsdom, component tests dispatch the components' custom events (`_change`, `_click`).
- React 19 passes props to custom elements as **properties**, not attributes, so tests assert on
  rendered text rather than on attributes of `goa-*` elements.
- axe finds a few issues inside the components (see README). They are filtered narrowly and would be
  worth raising upstream rather than working around in each service.
- The web components ship as one ~1.1 MB bundle (≈330 kB gzipped). Acceptable here; a production
  service would measure load performance.
