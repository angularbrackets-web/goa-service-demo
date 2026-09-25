import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Clock } from './clock.js';
import type { CreateReportDto } from './dto/create-report.dto.js';
import { ReferenceGenerator } from './reference.js';
import type { Report, ReportStatus } from './report.types.js';
import {
  DuplicateReferenceError,
  ReportsRepository,
} from './reports.repository.js';

/** Allowed status changes. A resolved report can be re-opened, not "un-received". */
const TRANSITIONS: Record<ReportStatus, readonly ReportStatus[]> = {
  RECEIVED: ['IN_PROGRESS', 'RESOLVED'],
  IN_PROGRESS: ['RECEIVED', 'RESOLVED'],
  RESOLVED: ['IN_PROGRESS'],
};

const MAX_REFERENCE_ATTEMPTS = 3;

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly repository: ReportsRepository,
    private readonly clock: Clock,
    private readonly references: ReferenceGenerator,
  ) {}

  async submit(dto: CreateReportDto): Promise<Report> {
    if (dto.noticedOn > this.clock.todayInAlberta()) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: [
          {
            field: 'noticedOn',
            message: 'The date must be today or in the past',
          },
        ],
      });
    }

    for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt++) {
      try {
        const report = await this.repository.create({
          reference: this.references.next(),
          issueType: dto.issueType,
          location: dto.location,
          description: dto.description,
          noticedOn: dto.noticedOn,
          contactEmail: dto.contactEmail ?? null,
        });
        // Log the reference only - never personal information.
        this.logger.log(`Report ${report.reference} received`);
        return report;
      } catch (error) {
        if (!(error instanceof DuplicateReferenceError)) throw error;
        this.logger.warn(`Reference collision on attempt ${attempt}`);
      }
    }
    throw new ConflictException(
      'Could not allocate a unique reference, please retry',
    );
  }

  list(status: ReportStatus | undefined, limit: number): Promise<Report[]> {
    return this.repository.list({ status, limit });
  }

  async get(reference: string): Promise<Report> {
    const report = await this.repository.findByReference(reference);
    if (!report) throw new NotFoundException(`Report ${reference} not found`);
    return report;
  }

  async changeStatus(reference: string, status: ReportStatus): Promise<Report> {
    const report = await this.get(reference);
    if (report.status === status) return report;
    if (!TRANSITIONS[report.status].includes(status)) {
      throw new ConflictException(
        `Cannot change status from ${report.status} to ${status}`,
      );
    }
    return this.repository.updateStatus(reference, status);
  }
}
