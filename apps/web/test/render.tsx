import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import type { Answers } from '../src/form/answers.ts';
import { ReportFormProvider } from '../src/form/ReportFormContext.tsx';

/** Shows the current path so tests can assert on navigation. */
function CurrentPath() {
  return <output data-testid="path">{useLocation().pathname}</output>;
}

export function renderPage(
  page: ReactElement,
  {
    path,
    url = path,
    answers,
  }: { path: string; url?: string; answers?: Partial<Answers> },
) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <ReportFormProvider initial={answers}>
        <Routes>
          <Route path={path} element={page} />
          <Route path="*" element={null} />
        </Routes>
        <CurrentPath />
      </ReportFormProvider>
    </MemoryRouter>,
  );
}

/**
 * The React wrappers listen for the web components' custom events
 * (e.g. `_change`, `_click`). In jsdom the components are not registered, so
 * tests dispatch those events directly - the same contract the real
 * components fulfil in the browser (covered by the Playwright tests).
 */
/** GoA wrappers pass `testId` through as the element's `testid` attribute. */
export const byTestId = (id: string) =>
  document.querySelector(`[testid="${id}"]`)!;

export function emit(
  element: Element,
  type: '_change' | '_click',
  detail: object = {},
) {
  element.dispatchEvent(
    new CustomEvent(type, { detail, bubbles: true, composed: true }),
  );
}
