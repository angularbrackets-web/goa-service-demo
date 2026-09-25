import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// The GoA web components are not registered in jsdom: <goa-*> elements render
// as plain custom elements, so tests assert on our own markup and on the
// attributes we pass to the design system (e.g. a form item's `error`).
afterEach(() => {
  cleanup();
  sessionStorage.clear();
});
