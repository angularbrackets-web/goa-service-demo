import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InMemoryReportsRepository } from '../../test/in-memory-reports.repository.js';
import { Clock } from './clock.js';
import type { CreateReportDto } from './dto/create-report.dto.js';
import { ReferenceGenerator } from './reference.js';
import { ReportsService } from './reports.service.js';

class FixedClock extends Clock {
  // 2026-09-25 09:00 in Edmonton (15:00 UTC)
  override now(): Date {
    return new Date('2026-09-25T15:00:00Z');
  }
}

class SequenceReferences extends ReferenceGenerator {
  constructor(private readonly values: string[]) {
    super();
  }
  override next(): string {
    return this.values.shift() ?? 'RD-ZZZZ-ZZZZ';
  }
}

const validAnswers: CreateReportDto = {
  issueType: 'POTHOLE',
  location: 'Highway 2 at Airport Road',
  description: 'Deep pothole in the right lane',
  noticedOn: '2026-09-24',
};

describe('ReportsService', () => {
  let repository: InMemoryReportsRepository;
  let service: ReportsService;

  beforeEach(() => {
    repository = new InMemoryReportsRepository();
    service = new ReportsService(
      repository,
      new FixedClock(),
      new SequenceReferences(['RD-AAAA-0001', 'RD-AAAA-0002']),
    );
  });

  describe('submit', () => {
    it('stores the report with a reference and RECEIVED status', async () => {
      const report = await service.submit(validAnswers);

      expect(report.reference).toBe('RD-AAAA-0001');
      expect(report.status).toBe('RECEIVED');
      expect(report.contactEmail).toBeNull();
      expect(repository.rows.size).toBe(1);
    });

    it('keeps the contact email only when one is given', async () => {
      const report = await service.submit({
        ...validAnswers,
        contactEmail: 'person@example.com',
      });
      expect(report.contactEmail).toBe('person@example.com');
    });

    it('accepts today (in Alberta time) but rejects a future date', async () => {
      await expect(
        service.submit({ ...validAnswers, noticedOn: '2026-09-25' }),
      ).resolves.toBeDefined();
      await expect(
        service.submit({ ...validAnswers, noticedOn: '2026-09-26' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('retries with a new reference when one collides', async () => {
      await repository.create({
        ...validAnswers,
        reference: 'RD-AAAA-0001',
        contactEmail: null,
      });

      const report = await service.submit(validAnswers);

      expect(report.reference).toBe('RD-AAAA-0002');
    });

    it('gives up after repeated collisions', async () => {
      const always = new SequenceReferences(Array(5).fill('RD-SAME-SAME'));
      service = new ReportsService(repository, new FixedClock(), always);
      await service.submit(validAnswers);

      await expect(service.submit(validAnswers)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('changeStatus', () => {
    it('moves a report through the triage workflow', async () => {
      const { reference } = await service.submit(validAnswers);

      await service.changeStatus(reference, 'IN_PROGRESS');
      const resolved = await service.changeStatus(reference, 'RESOLVED');

      expect(resolved.status).toBe('RESOLVED');
    });

    it('does not allow a resolved report to go back to RECEIVED', async () => {
      const { reference } = await service.submit(validAnswers);
      await service.changeStatus(reference, 'RESOLVED');

      await expect(
        service.changeStatus(reference, 'RECEIVED'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('returns 404 for an unknown reference', async () => {
      await expect(
        service.changeStatus('RD-NOPE-NOPE', 'RESOLVED'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
