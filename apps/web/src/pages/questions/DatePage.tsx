import { GoabDatePicker, GoabFormItem } from '@abgov/react-components';
import { QuestionPage } from '../../components/QuestionPage.tsx';
import { todayInAlberta } from '../../form/answers.ts';
import { useReportForm } from '../../form/ReportFormContext.tsx';

export function DatePage() {
  const { answers, update } = useReportForm();
  return (
    <QuestionPage step={3}>
      {(errors) => (
        <GoabFormItem
          id="noticedOn"
          error={errors.noticedOn}
          helpText="An approximate date is fine."
        >
          <GoabDatePicker
            name="noticedOn"
            type="input"
            value={answers.noticedOn || undefined}
            max={todayInAlberta()}
            error={!!errors.noticedOn}
            onChange={({ valueStr }) => update({ noticedOn: valueStr ?? '' })}
          />
        </GoabFormItem>
      )}
    </QuestionPage>
  );
}
