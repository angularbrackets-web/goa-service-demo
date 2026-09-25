import { Module } from '@nestjs/common';
import { StaffTokenGuard } from '../auth/staff-token.guard.js';
import { Clock } from './clock.js';
import { PrismaReportsRepository } from './prisma-reports.repository.js';
import { PublicReportsController } from './public-reports.controller.js';
import { ReferenceGenerator } from './reference.js';
import { ReportsRepository } from './reports.repository.js';
import { ReportsService } from './reports.service.js';
import { StaffReportsController } from './staff-reports.controller.js';

@Module({
  controllers: [PublicReportsController, StaffReportsController],
  providers: [
    ReportsService,
    Clock,
    ReferenceGenerator,
    StaffTokenGuard,
    // Bind the persistence port to its Prisma adapter.
    { provide: ReportsRepository, useClass: PrismaReportsRepository },
  ],
})
export class ReportsModule {}
