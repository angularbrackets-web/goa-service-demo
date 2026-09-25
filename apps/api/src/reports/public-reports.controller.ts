import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateReportDto } from './dto/create-report.dto.js';
import { SubmissionReceiptDto } from './dto/report-responses.dto.js';
import { ReportsService } from './reports.service.js';

@ApiTags('public')
@Controller('reports')
export class PublicReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Post()
  @HttpCode(201)
  @ApiCreatedResponse({ type: SubmissionReceiptDto })
  @ApiBadRequestResponse({ description: 'One or more answers are invalid.' })
  async submit(@Body() dto: CreateReportDto): Promise<SubmissionReceiptDto> {
    return SubmissionReceiptDto.from(await this.reports.submit(dto));
  }
}
