import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateReportDto } from './create-report.dto.js';

function errorsFor(input: Record<string, unknown>) {
  const dto = plainToInstance(CreateReportDto, input);
  return Object.fromEntries(
    validateSync(dto).map((e) => [
      e.property,
      Object.values(e.constraints ?? {}),
    ]),
  );
}

const valid = {
  issueType: 'DEBRIS',
  location: 'Whitemud Drive near 119 Street',
  description: 'Tire tread in the left lane',
  noticedOn: '2026-09-20',
};

describe('CreateReportDto', () => {
  it('accepts a complete, valid report', () => {
    expect(errorsFor(valid)).toEqual({});
  });

  it('uses plain-language messages for missing answers', () => {
    const errors = errorsFor({});
    expect(errors.issueType).toContain('Select the type of road issue');
    expect(errors.location).toContain('Enter where the issue is');
    expect(errors.description).toContain('Describe the issue');
    expect(errors.noticedOn).toContain('Enter a real date');
  });

  it('treats whitespace-only text as missing', () => {
    expect(errorsFor({ ...valid, location: '   ' }).location).toContain(
      'Enter where the issue is',
    );
  });

  it('rejects impossible dates', () => {
    expect(
      errorsFor({ ...valid, noticedOn: '2026-02-30' }).noticedOn,
    ).toBeDefined();
  });

  it('normalises the optional email and treats blank as not provided', () => {
    const dto = plainToInstance(CreateReportDto, {
      ...valid,
      contactEmail: '  Person@Example.COM ',
    });
    expect(dto.contactEmail).toBe('person@example.com');
    expect(errorsFor({ ...valid, contactEmail: '' })).toEqual({});
    expect(
      errorsFor({ ...valid, contactEmail: 'not-an-email' }).contactEmail,
    ).toBeDefined();
  });
});
