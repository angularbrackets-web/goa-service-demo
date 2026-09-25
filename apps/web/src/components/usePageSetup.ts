import { useEffect, useRef } from 'react';

const SERVICE = 'Report a road issue (demo)';

/**
 * Per-page accessibility housekeeping for a single-page app:
 * - a unique document title (WCAG 2.4.2), prefixed with "Error:" when invalid
 * - move focus to the page's <h1> after client-side navigation so screen
 *   reader and keyboard users start at the top of the new page
 */
export function usePageSetup(title: string, hasErrors = false) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = `${hasErrors ? 'Error: ' : ''}${title} - ${SERVICE}`;
  }, [title, hasErrors]);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return headingRef;
}
