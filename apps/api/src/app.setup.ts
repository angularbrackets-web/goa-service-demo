import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

/**
 * Cross-cutting HTTP configuration shared by `main.ts` and the integration
 * tests, so tests exercise exactly what production runs.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true, // ...and reject requests that send them
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          message: 'Validation failed',
          errors: flatten(errors),
        }),
    }),
  );

  const openApi = new DocumentBuilder()
    .setTitle('Report a road issue API (demo)')
    .setDescription(
      'Unofficial demo API - not affiliated with the Government of Alberta.',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, () =>
    SwaggerModule.createDocument(app, openApi),
  );
}

// When several rules fail for one field (e.g. a missing value also fails
// MaxLength), report the most fundamental one - "Enter X" beats "X is too long".
const RULE_PRIORITY = [
  'isNotEmpty',
  'isIn',
  'isString',
  'isIso8601',
  'isEmail',
];

/** Field-level errors the web app can map straight onto form items. */
export function flatten(errors: ValidationError[]) {
  return errors.map((error) => {
    const constraints = error.constraints ?? {};
    const rule =
      RULE_PRIORITY.find((name) => name in constraints) ??
      Object.keys(constraints)[0];
    return {
      field: error.property,
      message: (rule && constraints[rule]) || 'Invalid value',
    };
  });
}
