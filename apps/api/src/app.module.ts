import { Global, Module } from '@nestjs/common';
import { AppConfig } from './config.js';
import { HealthController } from './health/health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ReportsModule } from './reports/reports.module.js';

@Global()
@Module({
  imports: [PrismaModule, ReportsModule],
  controllers: [HealthController],
  providers: [{ provide: AppConfig, useFactory: () => new AppConfig() }],
  exports: [AppConfig],
})
export class AppModule {}
