import type { FieldErrors } from '../form/answers.ts';

export type ReportStatus = 'RECEIVED' | 'IN_PROGRESS' | 'RESOLVED';

export interface SubmissionReceipt {
  reference: string;
  submittedAt: string;
}

export interface ReportSummary {
  reference: string;
  issueType: string;
  location: string;
  description: string;
  noticedOn: string;
  status: ReportStatus;
  wantsUpdates: boolean;
  submittedAt: string;
}

/** The API rejected the answers; `fields` maps onto form items. */
export class ValidationFailed extends Error {
  readonly fields: FieldErrors;
  constructor(fields: FieldErrors) {
    super('Validation failed');
    this.fields = fields;
  }
}

export class Unauthorized extends Error {}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (response.status === 400) {
    const body = await response.json();
    const fields = Object.fromEntries(
      (body.errors ?? []).map((e: { field: string; message: string }) => [
        e.field,
        e.message,
      ]),
    );
    throw new ValidationFailed(fields);
  }
  if (response.status === 401) throw new Unauthorized();
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json() as Promise<T>;
}

export const api = {
  submitReport: (body: object) =>
    request<SubmissionReceipt>('/reports', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  listReports: (token: string, status?: ReportStatus) =>
    request<ReportSummary[]>(
      `/staff/reports${status ? `?status=${status}` : ''}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    ),

  changeStatus: (token: string, reference: string, status: ReportStatus) =>
    request<ReportSummary>(
      `/staff/reports/${encodeURIComponent(reference)}/status`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      },
    ),
};
