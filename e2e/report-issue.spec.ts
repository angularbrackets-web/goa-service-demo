import { expect, test } from '@playwright/test';
import { STAFF_TOKEN } from '../playwright.config';
import {
  chooseRadio,
  continueButton,
  expectNoAxeViolations,
  field,
  screenshot,
} from './helpers';

test.describe('Report a road issue', () => {
  test('citizen reports an issue and staff triage it @screenshots', async ({
    page,
  }) => {
    // Start page
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Report a road issue',
    );
    await expectNoAxeViolations(page);
    await screenshot(page, '01-start');
    await page.getByRole('button', { name: 'Start now' }).click();

    // Q1: issue type
    await expect(page).toHaveURL(/issue-type/);
    await expect(page.getByText('Question 1 of 5')).toBeVisible();
    await expectNoAxeViolations(page);
    await chooseRadio(page, 'Pothole');
    await continueButton(page).click();

    // Q2: location
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Where is the issue?',
    );
    await field(page, 'location').fill('Highway 16 westbound near Edson');
    await expectNoAxeViolations(page);
    await screenshot(page, '02-question-location');
    await continueButton(page).click();

    // Q3: description
    await field(page, 'description', 'textarea').fill(
      'Deep pothole in the right lane, about 40 cm wide.',
    );
    await expectNoAxeViolations(page);
    await continueButton(page).click();

    // Q4: date (GoA date picker: month dropdown + day + year)
    await field(page, 'month').click();
    await page.getByRole('option', { name: 'September' }).click();
    await field(page, 'day').fill('1');
    await field(page, 'year').fill('2026');
    await expectNoAxeViolations(page);
    await continueButton(page).click();

    // Q5: contact - "yes" reveals the email field
    await chooseRadio(page, 'Yes, email me updates');
    await field(page, 'contactEmail').fill('someone@example.com');
    await expectNoAxeViolations(page);
    await screenshot(page, '03-question-contact-reveal');
    await continueButton(page).click();

    // Check your answers
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Check your answers before submitting your report',
    );
    const summary = page.locator('.summary-list');
    await expect(summary).toContainText('Pothole');
    await expect(summary).toContainText('Highway 16 westbound near Edson');
    await expect(summary).toContainText('September 1, 2026');
    await expect(summary).toContainText('someone@example.com');
    await expectNoAxeViolations(page);
    await screenshot(page, '04-check-answers');
    await page.getByRole('button', { name: 'Submit report' }).click();

    // Confirmation
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Report submitted',
    );
    const reference = (await page
      .getByTestId('reference')
      .textContent())!.trim();
    expect(reference).toMatch(/^RD-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    await expectNoAxeViolations(page);
    await screenshot(page, '05-confirmation');

    // Staff triage
    await page.goto('/staff');
    await field(page, 'staffToken').fill(STAFF_TOKEN);
    await page.getByRole('button', { name: 'View reports' }).click();
    const row = page.getByRole('row').filter({ hasText: reference });
    await expect(row.locator('goa-badge').getByText('Received')).toBeVisible();
    await expect(row).toContainText('Yes'); // wants updates - but no email shown
    await expect(page.getByTestId('reports-table')).not.toContainText(
      'someone@example.com',
    );

    await row.locator(`input[name="status-${reference}"]`).click();
    await row.getByRole('option', { name: 'In progress' }).click();
    await expect(page.getByRole('status')).toHaveText(
      `${reference} changed to In progress`,
    );
    await expect(
      row.locator('goa-badge').getByText('In progress'),
    ).toBeVisible();
    await expectNoAxeViolations(page);
    await screenshot(page, '07-staff-triage');
  });

  test('shows an error summary and field error when a question is skipped @screenshots', async ({
    page,
  }) => {
    await page.goto('/report/issue-type');
    await continueButton(page).click();

    const errorSummary = page.getByTestId('error-summary');
    await expect(errorSummary).toBeFocused();
    await expect(errorSummary).toContainText('There is a problem');
    await expect(
      errorSummary.getByRole('link', { name: 'Select the type of road issue' }),
    ).toBeVisible();
    // ...and the same message on the field itself (rendered inside the form item)
    await expect(
      page.locator('goa-form-item').getByText('Select the type of road issue'),
    ).toBeVisible();
    await expect(page).toHaveTitle(/^Error: /);

    // The summary link moves focus to the field inside the web component
    await errorSummary.getByRole('link').click();
    await expect(page.locator('input[name="issueType"]').first()).toBeFocused();
    await expectNoAxeViolations(page);
    await screenshot(page, '06-validation-error');

    // Fixing the answer clears the error and moves on
    await chooseRadio(page, 'Debris on the road');
    await continueButton(page).click();
    await expect(page).toHaveURL(/\/report\/location$/);
  });

  test('check answers redirects to the first unanswered question', async ({
    page,
  }) => {
    await page.goto('/report/check-answers');
    await expect(page).toHaveURL(/\/report\/issue-type$/);
  });
});
