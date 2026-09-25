import { GoabLink } from '@abgov/react-components';
import { Link } from 'react-router';

export function BackLink({ to }: { to: string }) {
  return (
    <GoabLink leadingIcon="arrow-back" mb="l">
      <Link to={to}>Back</Link>
    </GoabLink>
  );
}
