import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StaffTokenGuard } from '../auth/staff-token.guard.js';
import { ListReportsQueryDto } from './dto/list-reports-query.dto.js';
import {
  ReportDetailDto,
  ReportSummaryDto,
} from './dto/report-responses.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { ReportsService } from './reports.service.js';

@ApiTags('staff')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid staff token.' })
@UseGuards(StaffTokenGuard)
@Controller('staff/reports')
export class StaffReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  @ApiOkResponse({ type: [ReportSummaryDto] })
  async list(@Query() query: ListReportsQueryDto): Promise<ReportSummaryDto[]> {
    const reports = await this.reports.list(query.status, query.limit);
    return reports.map((report) => ReportSummaryDto.from(report));
  }

  @Get(':reference')
  @ApiOkResponse({ type: ReportDetailDto })
  @ApiNotFoundResponse()
  async get(@Param('reference') reference: string): Promise<ReportDetailDto> {
    return ReportDetailDto.from(await this.reports.get(reference));
  }

  @Patch(':reference/status')
  @ApiOkResponse({ type: ReportSummaryDto })
  @ApiNotFoundResponse()
  @ApiConflictResponse({ description: 'The status change is not allowed.' })
  async changeStatus(
    @Param('reference') reference: string,
    @Body() dto: UpdateStatusDto,
  ): Promise<ReportSummaryDto> {
    return ReportSummaryDto.from(
      await this.reports.changeStatus(reference, dto.status),
    );
  }
}
