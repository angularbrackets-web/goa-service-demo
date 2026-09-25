/**
 * The citizen's answers and the rules for each question. Messages mirror the
 * API's class-validator messages so client- and server-side errors read the same.
 * (Kept as a small duplicate rather than a shared package - see ADR 0001.)
 */
export const ISSUE_TYPES = {
  POTHOLE: 'Pothole',
  DAMAGED_SIGN: 'Damaged or missing sign',
  STREETLIGHT_OUT: 'Streetlight not working',
  DEBRIS: 'Debris on the road',
  OTHER: 'Something else',
} as const;
export type IssueType = keyof typeof ISSUE_TYPES;

export const LIMITS = { location: 200, description: 1000 } as const;

export interface Answers {
  issueType?: IssueType;
  location: string;
  description: string;
  /** ISO date, YYYY-MM-DD */
  noticedOn: string;
  wantsUpdates?: 'yes' | 'no';
  contactEmail: string;
}

export const emptyAnswers: Answers = {
  location: '',
  description: '',
  noticedOn: '',
  contactEmail: '',
};

/** Field name -> message. An empty object means the page is valid. */
export type FieldErrors = Partial<Record<keyof Answers, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function todayInAlberta(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Edmonton',
  }).format(now);
}

export const validate = {
  issueType(a: Answers): FieldErrors {
    return a.issueType ? {} : { issueType: 'Select the type of road issue' };
  },
  location(a: Answers): FieldErrors {
    const value = a.location.trim();
    if (!value) return { location: 'Enter where the issue is' };
    if (value.length > LIMITS.location)
      return {
        location: `Location must be ${LIMITS.location} characters or fewer`,
      };
    return {};
  },
  description(a: Answers): FieldErrors {
    const value = a.description.trim();
    if (!value) return { description: 'Describe the issue' };
    if (value.length > LIMITS.description)
      return {
        description: `Description must be ${LIMITS.description} characters or fewer`,
      };
    return {};
  },
  noticedOn(a: Answers, today = todayInAlberta()): FieldErrors {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(a.noticedOn) ||
      Number.isNaN(Date.parse(a.noticedOn))
    )
      return { noticedOn: 'Enter a real date' };
    if (a.noticedOn > today)
      return { noticedOn: 'The date must be today or in the past' };
    return {};
  },
  contact(a: Answers): FieldErrors {
    if (!a.wantsUpdates)
      return { wantsUpdates: 'Select yes if you want updates by email' };
    if (a.wantsUpdates === 'yes' && !EMAIL.test(a.contactEmail.trim()))
      return {
        contactEmail:
          'Enter an email address in the correct format, like name@example.com',
      };
    return {};
  },
};

/** Shape the answers into the API request body (only what the API needs). */
export function toSubmission(a: Answers) {
  return {
    issueType: a.issueType,
    location: a.location.trim(),
    description: a.description.trim(),
    noticedOn: a.noticedOn,
    ...(a.wantsUpdates === 'yes'
      ? { contactEmail: a.contactEmail.trim() }
      : {}),
  };
}
