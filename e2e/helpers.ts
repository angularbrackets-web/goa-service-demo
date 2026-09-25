import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/**
 * Known issues inside the GoA web components themselves (v2.5.0), found by
 * this check. They are outside this app's control, so they are filtered out
 * narrowly - by rule AND by where they occur - and documented in the README.
 * Anything else, including the same rule elsewhere, still fails the test.
 */
type AxeNode = { html: string; target: unknown[] };
const KNOWN_UPSTREAM_ISSUES: {
  rule: string;
  matches: (node: AxeNode) => boolean;
}[] = [
  // Decorative icons: <goa-icon> renders <div role="img" aria-label=""> without aria-hidden
  {
    rule: 'role-img-alt',
    matches: (node) => node.html.includes('class="goa-icon '),
  },
  // <goa-date-picker type="input">: visible "Day"/"Year" labels are not
  // programmatically associated with their inputs (separate shadow roots)
  { rule: 'label', matches: (node) => host(node) === 'goa-date-picker' },
  // <goa-dropdown>: the popover's trigger <button> wraps the combobox <input>
  {
    rule: 'nested-interactive',
    matches: (node) => node.html.includes('popover-target'),
  },
];

/** The outermost element in axe's shadow-DOM-aware selector path. */
const host = (node: AxeNode) => String(node.target.flat()[0]);

/**
 * Fails the test if axe finds WCAG 2.x A/AA violations on the current page.
 * Automated checks catch only part of the problems - they complement, not
 * replace, keyboard and screen reader testing.
 */
export async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  const problems = results.violations.flatMap((violation) =>
    violation.nodes
      .filter(
        (node) =>
          !KNOWN_UPSTREAM_ISSUES.some(
            (known) => known.rule === violation.id && known.matches(node),
          ),
      )
      .map(
        (node) =>
          `${violation.id} (${violation.impact}): ${violation.help} -> ${node.target.join(' ')}`,
      ),
  );
  expect(problems, 'accessibility violations').toEqual([]);
}

/** Saves a documentation screenshot when run via `npm run screenshots`. */
export async function screenshot(page: Page, name: string) {
  if (!process.env.SCREENSHOTS) return;
  await page.waitForTimeout(300); // let web components finish rendering
  await page.screenshot({
    path: `docs/screenshots/${name}.png`,
    fullPage: true,
  });
}

/**
 * The GoA components render native controls in shadow DOM (Playwright's CSS
 * locators pierce it) and pass `name` through to the inner control.
 */
export const field = (page: Page, name: string, control = 'input') =>
  page.locator(`${control}[name="${name}"]`);

export const continueButton = (page: Page) =>
  page.getByRole('button', { name: 'Continue' });

/** Choose a GoA radio item by clicking its visible label, as a user would. */
export const chooseRadio = (page: Page, label: string) =>
  page.locator('goa-radio-item label').filter({ hasText: label }).click();
