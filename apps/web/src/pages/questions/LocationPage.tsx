import { GoabFormItem, GoabInput } from '@abgov/react-components';
import { QuestionPage } from '../../components/QuestionPage.tsx';
import { LIMITS } from '../../form/answers.ts';
import { useReportForm } from '../../form/ReportFormContext.tsx';
import { STEPS } from '../../form/steps.ts';

export function LocationPage() {
  const { answers, update } = useReportForm();
  return (
    <QuestionPage step={1}>
      {(errors) => (
        <GoabFormItem
          id="location"
          error={errors.location}
          helpText="For example, a street address, an intersection, or a highway and the nearest exit."
        >
          <GoabInput
            name="location"
            ariaLabel={STEPS[1].title}
            value={answers.location}
            error={!!errors.location}
            maxLength={LIMITS.location}
            width="100%"
            onChange={({ value }) => update({ location: value })}
          />
        </GoabFormItem>
      )}
    </QuestionPage>
  );
}
