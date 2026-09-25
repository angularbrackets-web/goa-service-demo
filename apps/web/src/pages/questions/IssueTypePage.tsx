import {
  GoabFormItem,
  GoabRadioGroup,
  GoabRadioItem,
} from '@abgov/react-components';
import { QuestionPage } from '../../components/QuestionPage.tsx';
import { ISSUE_TYPES, type IssueType } from '../../form/answers.ts';
import { useReportForm } from '../../form/ReportFormContext.tsx';
import { STEPS } from '../../form/steps.ts';

export function IssueTypePage() {
  const { answers, update } = useReportForm();
  return (
    <QuestionPage step={0}>
      {(errors) => (
        <GoabFormItem
          id="issueType"
          error={errors.issueType}
          type="radio-group"
        >
          <GoabRadioGroup
            name="issueType"
            ariaLabel={STEPS[0].title}
            value={answers.issueType}
            error={!!errors.issueType}
            onChange={({ value }) => update({ issueType: value as IssueType })}
          >
            {Object.entries(ISSUE_TYPES).map(([value, label]) => (
              <GoabRadioItem key={value} value={value} label={label} />
            ))}
          </GoabRadioGroup>
        </GoabFormItem>
      )}
    </QuestionPage>
  );
}
