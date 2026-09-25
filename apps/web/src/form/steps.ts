import { validate, type Answers, type FieldErrors } from './answers.ts';

/** The question pages, in order. Drives "Question X of Y", Back links and Continue. */
export const STEPS = [
  {
    path: '/report/issue-type',
    title: 'What type of road issue are you reporting?',
    validate: validate.issueType,
  },
  {
    path: '/report/location',
    title: 'Where is the issue?',
    validate: validate.location,
  },
  {
    path: '/report/description',
    title: 'Describe the issue',
    validate: validate.description,
  },
  {
    path: '/report/date',
    title: 'When did you notice it?',
    validate: (a: Answers) => validate.noticedOn(a),
  },
  {
    path: '/report/contact',
    title: 'Do you want updates about your report?',
    validate: validate.contact,
  },
] as const satisfies readonly {
  path: string;
  title: string;
  validate: (a: Answers) => FieldErrors;
}[];

export const CHECK_ANSWERS_PATH = '/report/check-answers';

export function stepIndex(path: string): number {
  return STEPS.findIndex((s) => s.path === path);
}

/** First question that is still unanswered or invalid, if any. */
export function firstIncompleteStep(answers: Answers) {
  return STEPS.find((s) => Object.keys(s.validate(answers)).length > 0);
}
