import { GoabFormItem, GoabTextArea } from '@abgov/react-components';
import { QuestionPage } from '../../components/QuestionPage.tsx';
import { LIMITS } from '../../form/answers.ts';
import { useReportForm } from '../../form/ReportFormContext.tsx';
import { STEPS } from '../../form/steps.ts';

export function DescriptionPage() {
  const { answers, update } = useReportForm();
  return (
    <QuestionPage step={2}>
      {(errors) => (
        <GoabFormItem
          id="description"
          error={errors.description}
          helpText="Include the size, which lane or side of the road, and anything that would help a crew find it. Do not include personal information."
        >
          <GoabTextArea
            name="description"
            ariaLabel={STEPS[2].title}
            value={answers.description}
            error={!!errors.description}
            rows={6}
            countBy="character"
            maxCount={LIMITS.description}
            onChange={({ value }) => update({ description: value })}
          />
        </GoabFormItem>
      )}
    </QuestionPage>
  );
}
