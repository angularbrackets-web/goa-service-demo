import {
  emptyAnswers,
  toSubmission,
  validate,
  type Answers,
} from './answers.ts';

const answers = (changes: Partial<Answers>): Answers => ({
  ...emptyAnswers,
  ...changes,
});

describe('validate', () => {
  it('requires an issue type', () => {
    expect(validate.issueType(answers({}))).toEqual({
      issueType: 'Select the type of road issue',
    });
    expect(validate.issueType(answers({ issueType: 'DEBRIS' }))).toEqual({});
  });

  it('treats whitespace as an empty location', () => {
    expect(validate.location(answers({ location: '   ' })).location).toBe(
      'Enter where the issue is',
    );
  });

  it('limits description length', () => {
    expect(
      validate.description(answers({ description: 'x'.repeat(1001) }))
        .description,
    ).toMatch(/1000 characters or fewer/);
  });

  it('accepts today but not a future date', () => {
    const today = '2026-09-25';
    expect(validate.noticedOn(answers({ noticedOn: today }), today)).toEqual(
      {},
    );
    expect(
      validate.noticedOn(answers({ noticedOn: '2026-09-26' }), today).noticedOn,
    ).toBe('The date must be today or in the past');
    expect(
      validate.noticedOn(answers({ noticedOn: '' }), today).noticedOn,
    ).toBe('Enter a real date');
  });

  it('only asks for an email when the person wants updates', () => {
    expect(validate.contact(answers({ wantsUpdates: 'no' }))).toEqual({});
    expect(
      validate.contact(answers({ wantsUpdates: 'yes', contactEmail: 'nope' })),
    ).toHaveProperty('contactEmail');
    expect(validate.contact(answers({}))).toHaveProperty('wantsUpdates');
  });
});

describe('toSubmission', () => {
  it('drops an email typed before switching to "no" (data minimisation)', () => {
    const body = toSubmission(
      answers({
        issueType: 'POTHOLE',
        location: ' Main St ',
        description: 'Hole',
        noticedOn: '2026-09-01',
        wantsUpdates: 'no',
        contactEmail: 'someone@example.com',
      }),
    );
    expect(body).toEqual({
      issueType: 'POTHOLE',
      location: 'Main St',
      description: 'Hole',
      noticedOn: '2026-09-01',
    });
  });
});
