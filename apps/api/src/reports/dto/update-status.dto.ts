import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { REPORT_STATUSES } from '../report.types.js';
import type { ReportStatus } from '../report.types.js';

export class UpdateStatusDto {
  @ApiProperty({ enum: REPORT_STATUSES, example: 'IN_PROGRESS' })
  @IsIn(REPORT_STATUSES, { message: 'Select a valid status' })
  status: ReportStatus;
}
