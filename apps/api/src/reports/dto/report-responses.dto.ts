import { ApiProperty } from '@nestjs/swagger';
import { ISSUE_TYPES, REPORT_STATUSES } from '../report.types.js';
import type { IssueType, Report, ReportStatus } from '../report.types.js';

/** Returned to the public after submitting: just enough to confirm receipt. */
export class SubmissionReceiptDto {
  @ApiProperty({ example: 'RD-7K3M-9QX2' })
  reference: string;

  @ApiProperty()
  submittedAt: string;

  static from(report: Report): SubmissionReceiptDto {
    return {
      reference: report.reference,
      submittedAt: report.createdAt.toISOString(),
    };
  }
}

/**
 * Staff list view. Deliberately omits the contact email (data minimisation):
 * triage only needs to know whether the person asked for updates.
 */
export class ReportSummaryDto {
  @ApiProperty({ example: 'RD-7K3M-9QX2' })
  reference: string;

  @ApiProperty({ enum: ISSUE_TYPES })
  issueType: IssueType;

  @ApiProperty()
  location: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ format: 'date' })
  noticedOn: string;

  @ApiProperty({ enum: REPORT_STATUSES })
  status: ReportStatus;

  @ApiProperty()
  wantsUpdates: boolean;

  @ApiProperty()
  submittedAt: string;

  static from(report: Report): ReportSummaryDto {
    return {
      reference: report.reference,
      issueType: report.issueType,
      location: report.location,
      description: report.description,
      noticedOn: report.noticedOn,
      status: report.status,
      wantsUpdates: report.contactEmail !== null,
      submittedAt: report.createdAt.toISOString(),
    };
  }
}

/** Single-report staff view, used when someone needs to follow up. */
export class ReportDetailDto extends ReportSummaryDto {
  @ApiProperty({ nullable: true, type: String })
  contactEmail: string | null;

  static override from(report: Report): ReportDetailDto {
    return {
      ...ReportSummaryDto.from(report),
      contactEmail: report.contactEmail,
    };
  }
}
