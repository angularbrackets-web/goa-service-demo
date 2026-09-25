import {
  GoabDetails,
  GoabFormItem,
  GoabInputEmail,
  GoabRadioGroup,
  GoabRadioItem,
} from '@abgov/react-components';
import { QuestionPage } from '../../components/QuestionPage.tsx';
import { useReportForm } from '../../form/ReportFormContext.tsx';
import { STEPS } from '../../form/steps.ts';

/** Uses the GoA "reveal input based on a selection" pattern for the email field. */
export function ContactPage() {
  const { answers, update } = useReportForm();
  return (
    <QuestionPage step={4}>
      {(errors) => (
        <>
          <GoabFormItem
            id="wantsUpdates"
            error={errors.wantsUpdates}
            type="radio-group"
          >
            <GoabRadioGroup
              name="wantsUpdates"
              ariaLabel={STEPS[4].title}
              value={answers.wantsUpdates}
              error={!!errors.wantsUpdates}
              onChange={({ value }) =>
                update({ wantsUpdates: value as 'yes' | 'no' })
              }
            >
              <GoabRadioItem
                value="yes"
                label="Yes, email me updates"
                reveal={
                  <GoabFormItem
                    id="contactEmail"
                    label="Email address"
                    error={errors.contactEmail}
                  >
                    <GoabInputEmail
                      name="contactEmail"
                      value={answers.contactEmail}
                      error={!!errors.contactEmail}
                      autoComplete="email"
                      width="100%"
                      onChange={({ value }) => update({ contactEmail: value })}
                    />
                  </GoabFormItem>
                }
              />
              <GoabRadioItem value="no" label="No, report anonymously" />
            </GoabRadioGroup>
          </GoabFormItem>

          <GoabDetails heading="Why are we asking for your email?" mt="l">
            <p>
              We only use your email to tell you when the status of this report
              changes. It is optional, and staff triaging reports do not see it
              in their list. In a real service this would be backed by a formal
              collection notice - see the privacy notice.
            </p>
          </GoabDetails>
        </>
      )}
    </QuestionPage>
  );
}
