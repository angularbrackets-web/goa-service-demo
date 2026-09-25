/**
 * Domain types for road issue reports. These are deliberately independent of
 * Prisma's generated types so the service layer does not depend on the ORM.
 */
export const ISSUE_TYPES = [
  'POTHOLE',
  'DAMAGED_SIGN',
  'STREETLIGHT_OUT',
  'DEBRIS',
  'OTHER',
] as const;
export type IssueType = (typeof ISSUE_TYPES)[number];

export const REPORT_STATUSES = ['RECEIVED', 'IN_PROGRESS', 'RESOLVED'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export interface Report {
  id: string;
  reference: string;
  issueType: IssueType;
  location: string;
  description: string;
  /** Calendar date (YYYY-MM-DD) the person noticed the issue. */
  noticedOn: string;
  contactEmail: string | null;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type NewReport = Pick<
  Report,
  | 'reference'
  | 'issueType'
  | 'location'
  | 'description'
  | 'noticedOn'
  | 'contactEmail'
>;

/** Maximum lengths shared by the DTOs and the database columns. */
export const LIMITS = {
  location: 200,
  description: 1000,
  email: 254,
} as const;
