import { GoabButton, GoabCallout } from '@abgov/react-components';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { api, ValidationFailed } from '../api/client.ts';
import { ErrorSummary } from '../components/ErrorSummary.tsx';
import { usePageSetup } from '../components/usePageSetup.ts';
import {
  ISSUE_TYPES,
  toSubmission,
  type FieldErrors,
} from '../form/answers.ts';
import { useReportForm } from '../form/ReportFormContext.tsx';
import { firstIncompleteStep, STEPS } from '../form/steps.ts';

/** Which question page to send the person back to for each API field. */
const FIELD_STEP: Record<string, string> = {
  issueType: STEPS[0].path,
  location: STEPS[1].path,
  description: STEPS[2].path,
  noticedOn: STEPS[3].path,
  contactEmail: STEPS[4].path,
};

export function CheckAnswersPage() {
  const { answers } = useReportForm();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const heading = usePageSetup(
    'Check your answers',
    Object.keys(errors).length > 0,
  );

  // Deep link or refreshed tab with missing answers: go to the first gap.
  const incomplete = firstIncompleteStep(answers);
  if (incomplete) return <Navigate to={incomplete.path} replace />;

  async function submit() {
    setSubmitting(true);
    setFailed(false);
    try {
      const receipt = await api.submitReport(toSubmission(answers));
      // The confirmation page clears the answers once it has rendered.
      navigate('/report/confirmation', { state: receipt, replace: true });
    } catch (error) {
      if (error instanceof ValidationFailed) setErrors(error.fields);
      else setFailed(true);
      setSubmitting(false);
    }
  }

  const rows = [
    {
      step: 0,
      label: 'Type of issue',
      value: answers.issueType && ISSUE_TYPES[answers.issueType],
    },
    { step: 1, label: 'Location', value: answers.location },
    { step: 2, label: 'Description', value: answers.description },
    { step: 3, label: 'Date noticed', value: formatDate(answers.noticedOn) },
    {
      step: 4,
      label: 'Email for updates',
      value:
        answers.wantsUpdates === 'yes' ? answers.contactEmail : 'Not provided',
    },
  ];

  return (
    <>
      <ErrorSummary
        errors={errors}
        hrefFor={(field) => `${FIELD_STEP[field] ?? '/'}?change=1`}
      />
      <h1 ref={heading} tabIndex={-1}>
        Check your answers before submitting your report
      </h1>

      <dl className="summary-list">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
            <dd>
              <Link to={`${STEPS[row.step].path}?change=1`}>
                Change{' '}
                <span className="visually-hidden">
                  {row.label.toLowerCase()}
                </span>
              </Link>
            </dd>
          </div>
        ))}
      </dl>

      {failed && (
        <GoabCallout
          type="emergency"
          heading="Sorry, there is a problem with the service"
          mb="l"
        >
          Your report has not been sent. Try again in a few minutes.
        </GoabCallout>
      )}

      <h2>Now send your report</h2>
      <p>
        By submitting this report you confirm the details are correct to the
        best of your knowledge.
      </p>
      <GoabButton
        type="primary"
        onClick={submit}
        disabled={submitting}
        testId="submit"
      >
        {submitting ? 'Sending...' : 'Submit report'}
      </GoabButton>
    </>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-CA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
