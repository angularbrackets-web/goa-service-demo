import { randomUUID } from 'node:crypto';
import type {
  NewReport,
  Report,
  ReportStatus,
} from '../src/reports/report.types.js';
import {
  DuplicateReferenceError,
  ListReportsFilter,
  ReportsRepository,
} from '../src/reports/reports.repository.js';

/** Test double that honours the same contract as the Prisma adapter. */
export class InMemoryReportsRepository extends ReportsRepository {
  readonly rows = new Map<string, Report>();

  async create(report: NewReport): Promise<Report> {
    if (this.rows.has(report.reference)) {
      throw new DuplicateReferenceError(report.reference);
    }
    const now = new Date();
    const row: Report = {
      ...report,
      id: randomUUID(),
      status: 'RECEIVED',
      createdAt: now,
      updatedAt: now,
    };
    this.rows.set(row.reference, row);
    return row;
  }

  async findByReference(reference: string): Promise<Report | null> {
    return this.rows.get(reference) ?? null;
  }

  async list({ status, limit }: ListReportsFilter): Promise<Report[]> {
    return [...this.rows.values()]
      .filter((row) => !status || row.status === status)
      .slice(0, limit);
  }

  async updateStatus(reference: string, status: ReportStatus): Promise<Report> {
    const row = { ...this.rows.get(reference)!, status, updatedAt: new Date() };
    this.rows.set(reference, row);
    return row;
  }
}
