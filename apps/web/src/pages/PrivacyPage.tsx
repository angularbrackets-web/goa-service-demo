import { usePageSetup } from '../components/usePageSetup.ts';

/** Plain-language privacy notice - the kind of collection notice a real service needs. */
export function PrivacyPage() {
  const heading = usePageSetup('Privacy notice');
  return (
    <>
      <h1 ref={heading} tabIndex={-1}>
        Privacy notice
      </h1>
      <p>
        This is an unofficial personal demo. It is not affiliated with or
        endorsed by the Government of Alberta, and it is not a real service. Do
        not enter real personal information.
      </p>
      <h2>What this demo collects</h2>
      <ul>
        <li>The type, location, description and date of the road issue.</li>
        <li>An email address, only if you choose to receive updates.</li>
      </ul>
      <h2>How it is designed to protect privacy</h2>
      <ul>
        <li>No name, phone number or address is asked for.</li>
        <li>
          Staff lists show only whether updates were requested, not the email
          itself.
        </li>
        <li>
          Answers in progress are kept in this browser tab only and cleared on
          submit.
        </li>
        <li>
          Server logs record reference numbers, never personal information.
        </li>
      </ul>
      <p>
        A real Government of Alberta service would publish a formal collection
        notice citing its legal authority under Alberta privacy legislation and
        a contact for questions.
      </p>
    </>
  );
}
