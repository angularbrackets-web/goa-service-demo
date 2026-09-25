import { Link } from 'react-router';
import { usePageSetup } from '../components/usePageSetup.ts';

export function NotFoundPage() {
  const heading = usePageSetup('Page not found');
  return (
    <>
      <h1 ref={heading} tabIndex={-1}>
        Page not found
      </h1>
      <p>If you typed the web address, check it is correct.</p>
      <p>
        <Link to="/">Go to the start page</Link>
      </p>
    </>
  );
}
