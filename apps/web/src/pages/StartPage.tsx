import { GoabButton, GoabCallout } from '@abgov/react-components';
import { useNavigate } from 'react-router';
import { usePageSetup } from '../components/usePageSetup.ts';
import { STEPS } from '../form/steps.ts';

/** GoA "start page" pattern: what the service does, what you need, then Start. */
export function StartPage() {
  const heading = usePageSetup('Report a road issue');
  const navigate = useNavigate();

  return (
    <>
      <h1 ref={heading} tabIndex={-1}>
        Report a road issue
      </h1>
      <p>
        Tell us about a pothole, damaged sign, broken streetlight or debris on a
        road so a crew can assess and repair it.
      </p>

      <GoabCallout type="emergency" heading="Is someone in danger?" mb="xl">
        If the issue is causing an emergency or immediate danger, call 911.
      </GoabCallout>

      <h2>Before you start</h2>
      <ul>
        <li>It takes about 3 minutes.</li>
        <li>
          You will need to describe where the issue is, such as an address or
          intersection.
        </li>
        <li>
          You can report anonymously. We only ask for an email if you want
          updates.
        </li>
      </ul>

      <GoabButton
        type="start"
        mt="l"
        mb="2xl"
        onClick={() => navigate(STEPS[0].path)}
      >
        Start now
      </GoabButton>

      <h2>Other ways to report</h2>
      <p>
        This is a fictional demo service, so there are no other channels. A real
        service would list a phone number and hours here.
      </p>
    </>
  );
}
