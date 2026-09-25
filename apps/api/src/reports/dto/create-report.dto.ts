import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ISSUE_TYPES, LIMITS } from '../report.types.js';
import type { IssueType } from '../report.types.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/**
 * What a member of the public submits. Messages are written in plain language
 * because the web app can show them directly next to the matching field.
 */
export class CreateReportDto {
  @ApiProperty({ enum: ISSUE_TYPES, example: 'POTHOLE' })
  @IsIn(ISSUE_TYPES, { message: 'Select the type of road issue' })
  issueType: IssueType;

  @ApiProperty({
    maxLength: LIMITS.location,
    example: 'Highway 2 northbound, just past the Airport Road exit',
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Enter where the issue is' })
  @MaxLength(LIMITS.location, {
    message: `Location must be ${LIMITS.location} characters or fewer`,
  })
  location: string;

  @ApiProperty({
    maxLength: LIMITS.description,
    example: 'Large pothole in the right lane, about 50 cm wide.',
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Describe the issue' })
  @MaxLength(LIMITS.description, {
    message: `Description must be ${LIMITS.description} characters or fewer`,
  })
  description: string;

  @ApiProperty({ format: 'date', example: '2026-09-20' })
  @IsISO8601(
    { strict: true, strictSeparator: true },
    { message: 'Enter a real date' },
  )
  noticedOn: string;

  @ApiPropertyOptional({
    description:
      'Only collected when the person asks for updates. Omit to report anonymously.',
    example: 'person@example.com',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() || undefined : value,
  )
  @IsEmail(
    {},
    {
      message:
        'Enter an email address in the correct format, like name@example.com',
    },
  )
  @MaxLength(LIMITS.email)
  contactEmail?: string;
}
