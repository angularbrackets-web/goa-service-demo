import { GoabCallout } from '@abgov/react-components';
import { useEffect, useRef } from 'react';
import type { FieldErrors } from '../form/answers.ts';
import { focusField } from './focusField.ts';

interface Props {
  errors: FieldErrors;
  /** Optional per-field link target (e.g. a "change" page on the review screen). */
  hrefFor?: (field: string) => string;
}

/**
 * Lists every problem at the top of the page and receives focus, so keyboard
 * and screen reader users learn what went wrong (WCAG 3.3.1 Error
 * Identification). Each message links to the field it belongs to.
 */
export function ErrorSummary({ errors, hrefFor }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const entries = Object.entries(errors).filter(([, message]) => message);

  useEffect(() => {
    if (entries.length) ref.current?.focus();
  }, [entries.length, errors]);

  if (!entries.length) return null;

  return (
    <div ref={ref} tabIndex={-1} data-testid="error-summary">
      <GoabCallout type="emergency" heading="There is a problem" mb="l">
        <ul>
          {entries.map(([field, message]) => (
            <li key={field}>
              <a
                href={hrefFor ? hrefFor(field) : `#${field}`}
                onClick={(event) => {
                  if (hrefFor) return; // real navigation
                  event.preventDefault();
                  focusField(field);
                }}
              >
                {message}
              </a>
            </li>
          ))}
        </ul>
      </GoabCallout>
    </div>
  );
}
