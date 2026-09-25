import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import type { RoadIssueReport } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { NewReport, Report, ReportStatus } from './report.types.js';
import {
  DuplicateReferenceError,
  ListReportsFilter,
  ReportsRepository,
} from './reports.repository.js';

@Injectable()
export class PrismaReportsRepository extends ReportsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(report: NewReport): Promise<Report> {
    try {
      const row = await this.prisma.roadIssueReport.create({
        data: {
          ...report,
          noticedOn: new Date(`${report.noticedOn}T00:00:00Z`),
        },
      });
      return toDomain(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new DuplicateReferenceError(report.reference);
      }
      throw error;
    }
  }

  async findByReference(reference: string): Promise<Report | null> {
    const row = await this.prisma.roadIssueReport.findUnique({
      where: { reference },
    });
    return row ? toDomain(row) : null;
  }

  async list({ status, limit }: ListReportsFilter): Promise<Report[]> {
    const rows = await this.prisma.roadIssueReport.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(toDomain);
  }

  async updateStatus(reference: string, status: ReportStatus): Promise<Report> {
    const row = await this.prisma.roadIssueReport.update({
      where: { reference },
      data: { status },
    });
    return toDomain(row);
  }
}

function toDomain(row: RoadIssueReport): Report {
  return {
    ...row,
    // DATE columns come back as midnight UTC; keep only the calendar date.
    noticedOn: row.noticedOn.toISOString().slice(0, 10),
  };
}
