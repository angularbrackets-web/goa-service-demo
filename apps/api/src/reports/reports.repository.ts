import type { NewReport, Report, ReportStatus } from './report.types.js';

export interface ListReportsFilter {
  status?: ReportStatus;
  limit: number;
}

/**
 * Persistence port for reports. The service depends on this abstraction;
 * `PrismaReportsRepository` is the production adapter and unit tests use an
 * in-memory fake. (An abstract class doubles as the Nest DI token.)
 */
export abstract class ReportsRepository {
  abstract create(report: NewReport): Promise<Report>;
  abstract findByReference(reference: string): Promise<Report | null>;
  abstract list(filter: ListReportsFilter): Promise<Report[]>;
  abstract updateStatus(
    reference: string,
    status: ReportStatus,
  ): Promise<Report>;
}

/** Thrown by adapters when a unique reference collides. */
export class DuplicateReferenceError extends Error {
  constructor(reference: string) {
    super(`Reference ${reference} already exists`);
  }
}
