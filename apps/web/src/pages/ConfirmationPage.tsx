import { GoabCallout } from '@abgov/react-components';
import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import type { SubmissionReceipt } from '../api/client.ts';
import { usePageSetup } from '../components/usePageSetup.ts';
import { useReportForm } from '../form/ReportFormContext.tsx';

/** GoA "result page" pattern: success callout, reference number, what happens next. */
export function ConfirmationPage() {
  const receipt = useLocation().state as SubmissionReceipt | null;
  const heading = usePageSetup('Report submitted');
  const { reset } = useReportForm();

  // Submitted: forget the answers so they do not linger in this browser tab.
  useEffect(() => {
    if (receipt) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt]);
  if (!receipt) return <Navigate to="/" replace />;

  return (
    <>
      <h1 ref={heading} tabIndex={-1}>
        Report submitted
      </h1>
      <GoabCallout
        type="success"
        heading="We have received your report"
        mb="xl"
      >
        <p>Your reference number is</p>
        <p className="reference" data-testid="reference">
          {receipt.reference}
        </p>
      </GoabCallout>

      <h2>What happens next</h2>
      <ol>
        <li>
          A staff member reviews the report, usually within 2 business days.
        </li>
        <li>If it needs repair, it is scheduled with a maintenance crew.</li>
        <li>If you asked for updates, we email you when the status changes.</li>
      </ol>
      <p>
        Keep your reference number if you need to contact us about this report.
      </p>
      <p>
        <Link to="/">Report another issue</Link>
      </p>
    </>
  );
}
