import { GoabButton } from '@abgov/react-components';
import { useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useReportForm } from '../form/ReportFormContext.tsx';
import type { FieldErrors } from '../form/answers.ts';
import { CHECK_ANSWERS_PATH, STEPS } from '../form/steps.ts';
import { BackLink } from './BackLink.tsx';
import { ErrorSummary } from './ErrorSummary.tsx';
import { usePageSetup } from './usePageSetup.ts';

interface Props {
  step: number;
  /** Renders the page's field(s), given the current errors. */
  children: (errors: FieldErrors) => ReactNode;
  /** Content shown between the heading and the fields. */
  intro?: ReactNode;
}

/**
 * GoA "question page" pattern: back link, progress caption, one question as
 * the page heading, the field(s), and a Continue button. Validation runs on
 * Continue (not on every keystroke) and errors appear both in the summary and
 * on the field.
 */
export function QuestionPage({ step, children, intro }: Props) {
  const { title, validate } = STEPS[step];
  const { answers } = useReportForm();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const changing = params.get('change') === '1';
  const [errors, setErrors] = useState<FieldErrors>({});
  const headingRef = usePageSetup(title, Object.keys(errors).length > 0);

  const previous = changing
    ? CHECK_ANSWERS_PATH
    : (STEPS[step - 1]?.path ?? '/');
  const next = changing
    ? CHECK_ANSWERS_PATH
    : (STEPS[step + 1]?.path ?? CHECK_ANSWERS_PATH);

  function onContinue() {
    const found = validate(answers);
    setErrors(found);
    if (Object.keys(found).length === 0) navigate(next);
  }

  return (
    <>
      <BackLink to={previous} />
      <p className="caption">
        Question {step + 1} of {STEPS.length}
      </p>
      <ErrorSummary errors={errors} />
      <h1 ref={headingRef} tabIndex={-1}>
        {title}
      </h1>
      {intro}
      {children(errors)}
      <GoabButton type="primary" mt="xl" onClick={onContinue} testId="continue">
        {changing ? 'Save and return' : 'Continue'}
      </GoabButton>
    </>
  );
}
